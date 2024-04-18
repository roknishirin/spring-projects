#include "kvs_clock.h"

#include "constants.h"
#include "kvs_base.h"

#define _POSIX_C_SOURCE 200809L

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct kvs_clock {
  // TODO: add necessary variables
  kvs_base_t* kvs_base;
  int capacity;

  int size;
  int hand;
  int* reference_bits;
  char** keys;
  char** values;

  bool* dirty;  // Array to track cache entry states
};

kvs_clock_t* kvs_clock_new(kvs_base_t* kvs, int capacity) {
  kvs_clock_t* kvs_clock = malloc(sizeof(kvs_clock_t));
  kvs_clock->kvs_base = kvs;
  kvs_clock->capacity = capacity;

  // TODO: initialize other variables
  kvs_clock->size = 0;
  kvs_clock->hand = 0;
  kvs_clock->reference_bits = malloc(capacity * sizeof(int));

  kvs_clock->keys = malloc(capacity * sizeof(char[KVS_KEY_MAX]));
  kvs_clock->values = malloc(capacity * sizeof(char[KVS_VALUE_MAX]));

  kvs_clock->dirty = malloc(capacity * sizeof(bool));

  for (int i = 0; i < capacity; i++) {
    kvs_clock->reference_bits[i] = 0;
    kvs_clock->dirty[i] = false;  // Initialize all entries as clean
  }

  return kvs_clock;
}

void kvs_clock_free(kvs_clock_t** ptr) {
  // TODO: free dynamically allocated memory
  if (*ptr == NULL) {
    return;
  }

  kvs_clock_t* kvs_clock = *ptr;

  for (int i = 0; i < kvs_clock->size; i++) {
    free(kvs_clock->keys[i]);
    free(kvs_clock->values[i]);
  }

  free(kvs_clock->reference_bits);
  free(kvs_clock->keys);
  free(kvs_clock->values);
  free(kvs_clock->dirty);

  free(kvs_clock);

  *ptr = NULL;
}

int kvs_clock_set(kvs_clock_t* kvs_clock, const char* key, const char* value) {
  // TODO: implement this function

  // if capacity is 0
  if (kvs_clock->capacity == 0) {
    return kvs_base_set(kvs_clock->kvs_base, key, value);
  }

  // check to see if it already exists in the cache
  // if it does, update the value
  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(kvs_clock->keys[i], key) == 0) {
      free(kvs_clock->values[i]);
      kvs_clock->values[i] = strdup(value);
      kvs_clock->reference_bits[i] = 1;  // r subset is now
      kvs_clock->dirty[i] = true;        // dirty so dont put it back in disk
      return SUCCESS;
    }
  }

  // before you reach capacity
  if (kvs_clock->size < kvs_clock->capacity) {
    int index = kvs_clock->size;
    kvs_clock->keys[index] = strdup(key);
    kvs_clock->values[index] = strdup(value);
    kvs_clock->dirty[index] = true;
    kvs_clock->reference_bits[index] = 1;
    kvs_clock->size++;
    return SUCCESS;
  }

  // If the cache is full, evict an entry
  if (kvs_clock->size >= kvs_clock->capacity) {
    bool evicted = false;
    while (!evicted) {
      if (kvs_clock->reference_bits[kvs_clock->hand] == 0) {
        // Evict the entry
        const char* evicted_key = kvs_clock->keys[kvs_clock->hand];
        const char* evicted_value = kvs_clock->values[kvs_clock->hand];

        if (kvs_clock->dirty[kvs_clock->hand]) {
          int progress =
              kvs_base_set(kvs_clock->kvs_base, evicted_key, evicted_value);
          if (progress == FAILURE) {
            return FAILURE;
          }
        }

        free(kvs_clock->keys[kvs_clock->hand]);
        free(kvs_clock->values[kvs_clock->hand]);
        kvs_clock->keys[kvs_clock->hand] = strdup(key);
        kvs_clock->values[kvs_clock->hand] = strdup(value);
        kvs_clock->dirty[kvs_clock->hand] = true;
        kvs_clock->reference_bits[kvs_clock->hand] = 1;
        kvs_clock->hand = (kvs_clock->hand + 1) % kvs_clock->capacity;
        evicted = true;

      } else {
        // Clear the reference bit and move the hand
        kvs_clock->reference_bits[kvs_clock->hand] = 0;
        kvs_clock->hand = (kvs_clock->hand + 1) % kvs_clock->capacity;
      }
    }
  }
  return SUCCESS;
}

int kvs_clock_get(kvs_clock_t* kvs_clock, const char* key, char* value) {
  // TODO: implement this function

  // if capacity is 0
  if (kvs_clock->capacity == 0) {
    return kvs_base_get(kvs_clock->kvs_base, key, value);
  }

  // if in cache
  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(kvs_clock->keys[i], key) == 0) {
      // Set the value and update the reference bit
      strcpy(value, kvs_clock->values[i]);
      kvs_clock->reference_bits[i] = 1;
      return SUCCESS;
    }
  }

  // If the key is not in the cache,
  // read the value from the disk
  int disk_val = kvs_base_get(kvs_clock->kvs_base, key, value);

  // if it is in the disk
  if (disk_val == SUCCESS) {
    // basically just  call fifo_set again
    kvs_clock_set(kvs_clock, key, value);

  } else {
    return FAILURE;
  }

  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(kvs_clock->keys[i], key) == 0) {
      kvs_clock->dirty[i] = false;
    }
  }

  return SUCCESS;
}

int kvs_clock_flush(kvs_clock_t* kvs_clock) {
  // TODO: implement this function

  for (int i = 0; i < kvs_clock->size; i++) {
    if (kvs_clock->dirty[i]) {
      const char* key = kvs_clock->keys[i];
      const char* value = kvs_clock->values[i];
      int progress = kvs_base_set(kvs_clock->kvs_base, key, value);
      if (progress == FAILURE) {
        return FAILURE;
      }

      kvs_clock->dirty[i] = false;
    }
  }

  return SUCCESS;
}
