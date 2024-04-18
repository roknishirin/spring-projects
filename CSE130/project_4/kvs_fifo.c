#include "kvs_fifo.h"

#include "constants.h"
#include "kvs_base.h"

#define _POSIX_C_SOURCE 200809L

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct kvs_fifo {
  // TODO: add necessary variables
  kvs_base_t* kvs_base;
  int capacity;

  // new variables
  char** keys;
  char** values;
  int head;
  int tail;
  int size;

  bool* dirty;  // Array to track cache entry states
};

kvs_fifo_t* kvs_fifo_new(kvs_base_t* kvs, int capacity) {
  kvs_fifo_t* kvs_fifo = malloc(sizeof(kvs_fifo_t));
  kvs_fifo->kvs_base = kvs;
  kvs_fifo->capacity = capacity;

  // TODO: initialize other variables
  kvs_fifo->keys = malloc(capacity * sizeof(char[KVS_KEY_MAX]));
  kvs_fifo->values = malloc(capacity * sizeof(char[KVS_VALUE_MAX]));

  kvs_fifo->head = 0;
  kvs_fifo->tail = 0;
  kvs_fifo->size = 0;

  // Initialize dirty flags for each entry
  kvs_fifo->dirty = malloc(capacity * sizeof(bool));
  for (int i = 0; i < capacity; i++) {
    kvs_fifo->dirty[i] = false;  // Initialize all entries as clean
  }

  return kvs_fifo;
}

void kvs_fifo_free(kvs_fifo_t** ptr) {
  // TODO: free dynamically allocated memory

  kvs_fifo_t* kvs_fifo = *ptr;

  for (int i = 0; i < kvs_fifo->size; i++) {
    free(kvs_fifo->keys[i]);
    free(kvs_fifo->values[i]);
  }
  free(kvs_fifo->keys);
  free(kvs_fifo->values);
  free(kvs_fifo->dirty);

  free(*ptr);
  *ptr = NULL;
}

// It creates a file named key and writes value for its content.
// If the file already exists, it overwrites the content.
int kvs_fifo_set(kvs_fifo_t* kvs_fifo, const char* key, const char* value) {
  // TODO: implement this function

  // If capacity is 0
  if (kvs_fifo->capacity == 0) {
    return kvs_base_set(kvs_fifo->kvs_base, key, value);
  }

  // check to see if it already exists in the cache
  // if it does, update the value
  for (int i = 0; i < kvs_fifo->size; i++) {
    if (strcmp(kvs_fifo->keys[i], key) == 0) {
      free(kvs_fifo->values[i]);
      kvs_fifo->values[i] = strdup(value);
      kvs_fifo->dirty[i] = true;  // dirty so dont put it back in disk
      return SUCCESS;
    }
  }

  // if cache is full
  // evict the least recently added entry
  if (kvs_fifo->size >= kvs_fifo->capacity) {
    // adding it to the disk
    const char* evicted_key = kvs_fifo->keys[kvs_fifo->head];
    const char* evicted_value = kvs_fifo->values[kvs_fifo->head];
    if (kvs_fifo->dirty[kvs_fifo->head]) {
      int progress =
          kvs_base_set(kvs_fifo->kvs_base, evicted_key, evicted_value);
      if (progress == FAILURE) {
        return FAILURE;
      }
    }

    free(kvs_fifo->keys[kvs_fifo->head]);
    free(kvs_fifo->values[kvs_fifo->head]);
    kvs_fifo->head =
        (kvs_fifo->head + 1) %
        kvs_fifo->capacity;  // wraps around to the first position if necessary
    kvs_fifo->size--;
  }

  // and add new entry to cache
  kvs_fifo->keys[kvs_fifo->tail] = strdup(key);
  kvs_fifo->values[kvs_fifo->tail] = strdup(value);
  kvs_fifo->dirty[kvs_fifo->tail] = true;
  kvs_fifo->tail = (kvs_fifo->tail + 1) % kvs_fifo->capacity;
  kvs_fifo->size++;

  return SUCCESS;
}

// It reads the file key and returns its content.
// If the file does not exist, it returns the empty string.
int kvs_fifo_get(kvs_fifo_t* kvs_fifo, const char* key, char* value) {
  // TODO: implement this function

  // if capacity is 0
  if (kvs_fifo->capacity == 0) {
    return kvs_base_get(kvs_fifo->kvs_base, key, value);
  }

  // check to see if it already exists in the cache
  for (int i = 0; i < kvs_fifo->size; i++) {
    if (strcmp(kvs_fifo->keys[i], key) == 0) {
      strcpy(value,
             kvs_fifo->values[i]);  // Copy the value to the provided buffer
      return SUCCESS;
    }
  }

  // If the key is not in the cache,
  // read the value from the disk
  int disk_val = kvs_base_get(kvs_fifo->kvs_base, key, value);

  // if it is in the disk
  if (disk_val == SUCCESS) {
    // basically just  call fifo_set again
    kvs_fifo_set(kvs_fifo, key, value);

  } else {
    return FAILURE;
  }

  for (int i = 0; i < kvs_fifo->size; i++) {
    if (strcmp(kvs_fifo->keys[i], key) == 0) {
      kvs_fifo->dirty[i] = false;
    }
  }

  return SUCCESS;
}

// move everything from cache to disk
int kvs_fifo_flush(kvs_fifo_t* kvs_fifo) {
  // TODO: implement this function

  // Iterate through all entries in the cache
  for (int i = 0; i < kvs_fifo->size; i++) {
    if (kvs_fifo->dirty[i]) {
      const char* key = kvs_fifo->keys[i];
      const char* value = kvs_fifo->values[i];

      // const char* key = kvs_fifo->keys[kvs_fifo->head];
      // const char* value = kvs_fifo->values[kvs_fifo->head];

      // Add the entry to the disk
      int progress = kvs_base_set(kvs_fifo->kvs_base, key, value);
      if (progress == FAILURE) {
        return FAILURE;
      }

      kvs_fifo->dirty[i] = false;
    }
  }

  return SUCCESS;
}
