#include "kvs_clock.h"

#define _POSIX_C_SOURCE 200809L

#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

struct kvs_clock {
  // TODO: add necessary variables
  kvs_base_t* kvs_base;
  int capacity;
  int hand;
  int size;
  char** keys;
  char** vals;
  bool* dirty;
  bool* reference;
};

kvs_clock_t* kvs_clock_new(kvs_base_t* kvs, int capacity) {
  kvs_clock_t* kvs_clock = malloc(sizeof(kvs_clock_t));
  kvs_clock->kvs_base = kvs;
  kvs_clock->capacity = capacity;

  // TODO: initialize other variables
  kvs_clock->hand = 0;
  kvs_clock->size = 0;
  kvs_clock->keys = calloc(capacity, sizeof(char[KVS_KEY_MAX]));
  kvs_clock->vals = calloc(capacity, sizeof(char[KVS_VALUE_MAX]));
  kvs_clock->dirty = calloc(capacity, sizeof(bool*));
  for (int i = 0; i < capacity; i++) {
    kvs_clock->dirty[i] = false;
  }
  kvs_clock->reference = calloc(capacity, sizeof(bool*));
  for (int i = 0; i < capacity; i++) {
    kvs_clock->reference[i] = false;
  }

  return kvs_clock;
}

void kvs_clock_free(kvs_clock_t** ptr) {
  // TODO: free dynamically allocated memory
  for (int i = 0; i < (*ptr)->size; i++) {
    free((*ptr)->keys[i]);
    free((*ptr)->vals[i]);
  }
  free((*ptr)->keys);
  free((*ptr)->vals);
  free((*ptr)->dirty);
  free((*ptr)->reference);
  free(*ptr);
  *ptr = NULL;
}

int kvs_clock_set(kvs_clock_t* kvs_clock, const char* key, const char* value) {
  // TODO: implement this function
  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(key, kvs_clock->keys[i]) == 0) {
      free(kvs_clock->vals[i]);
      kvs_clock->vals[i] = strdup(value);
      kvs_clock->dirty[i] = true;
      kvs_clock->reference[i] = true;
      return SUCCESS;
    }
  }
  if (kvs_clock->size < kvs_clock->capacity) {
    kvs_clock->keys[kvs_clock->size] = strdup(key);
    kvs_clock->vals[kvs_clock->size] = strdup(value);
    kvs_clock->dirty[kvs_clock->size] = true;
    kvs_clock->size++;
    return SUCCESS;
  }
  while (kvs_clock->reference[kvs_clock->hand]) {
    kvs_clock->reference[kvs_clock->hand] = false;
    kvs_clock->hand++;
    if (kvs_clock->hand == kvs_clock->capacity) {
      kvs_clock->hand = 0;
    }
  }
  int ret_val = SUCCESS;
  if (kvs_clock->dirty[kvs_clock->hand]) {
    ret_val =
        kvs_base_set(kvs_clock->kvs_base, kvs_clock->keys[kvs_clock->hand],
                     kvs_clock->vals[kvs_clock->hand]);
  }
  if (ret_val == SUCCESS) {
    free(kvs_clock->keys[kvs_clock->hand]);
    free(kvs_clock->vals[kvs_clock->hand]);
    kvs_clock->keys[kvs_clock->hand] = strdup(key);
    kvs_clock->vals[kvs_clock->hand] = strdup(value);
    kvs_clock->dirty[kvs_clock->hand] = true;
    kvs_clock->hand++;
    if (kvs_clock->hand == kvs_clock->capacity) {
      kvs_clock->hand = 0;
    }
    return SUCCESS;
  } else {
    return FAILURE;
  }
}

int kvs_clock_get(kvs_clock_t* kvs_clock, const char* key, char* value) {
  // TODO: implement this function
  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(key, kvs_clock->keys[i]) == 0) {
      strcpy(value, kvs_clock->vals[i]);
      kvs_clock->reference[i] = true;
      return SUCCESS;
    }
  }
  int ret_val = kvs_base_get(kvs_clock->kvs_base, key, value);
  if (ret_val == FAILURE) {
    return FAILURE;
  }
  ret_val = kvs_clock_set(kvs_clock, key, value);
  if (ret_val == FAILURE) {
    return FAILURE;
  }
  for (int i = 0; i < kvs_clock->size; i++) {
    if (strcmp(key, kvs_clock->keys[i]) == 0) {
      kvs_clock->dirty[i] = false;
      return SUCCESS;
    }
  }
  return SUCCESS;
}

int kvs_clock_flush(kvs_clock_t* kvs_clock) {
  // TODO: implement this function
  bool failed = false;
  int ret_val;
  for (int i = 0; i < kvs_clock->size; i++) {
    if (kvs_clock->dirty[i]) {
      ret_val = kvs_base_set(kvs_clock->kvs_base, kvs_clock->keys[i],
                             kvs_clock->vals[i]);
      if (ret_val == FAILURE) {
        failed = true;
      }
    }
  }
  if (failed) {
    return FAILURE;
  }
  return SUCCESS;
}
