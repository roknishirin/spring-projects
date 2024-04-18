#include "kvs_lru.h"

#include "constants.h"
#include "kvs_base.h"

#define _POSIX_C_SOURCE 200809L

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct NodeObj {
  char* key;
  char* value;
  struct NodeObj* next;
  struct NodeObj* prev;
  int dirty;  // modified
} NodeObj;

struct kvs_lru {
  // TODO: add necessary variables
  kvs_base_t* kvs_base;
  int capacity;
  int size;

  NodeObj* head;
  NodeObj* tail;
};

NodeObj* node_create(const char* key, const char* value) {
  NodeObj* n = malloc(sizeof(NodeObj));
  n->key = strdup(key);
  n->value = strdup(value);
  n->dirty = 1;
  return n;
}

kvs_lru_t* kvs_lru_new(kvs_base_t* kvs, int capacity) {
  kvs_lru_t* kvs_lru = malloc(sizeof(kvs_lru_t));
  kvs_lru->kvs_base = kvs;
  kvs_lru->capacity = capacity;
  kvs_lru->size = 0;

  // malloc nodeobj
  kvs_lru->head = malloc(sizeof(NodeObj));
  kvs_lru->tail = malloc(sizeof(NodeObj));
  kvs_lru->head->next = kvs_lru->tail;
  kvs_lru->tail->prev = kvs_lru->head;
  kvs_lru->head->prev = NULL;
  kvs_lru->tail->next = NULL;

  kvs_lru->head->key = NULL;
  kvs_lru->tail->key = NULL;
  kvs_lru->head->value = NULL;
  kvs_lru->tail->value = NULL;

  // impossible modification for sentinel nodes
  kvs_lru->head->dirty = -1;
  kvs_lru->tail->dirty = -1;

  return kvs_lru;
}

void kvs_lru_free(kvs_lru_t** ptr) {
  // TODO: free dynamically allocated memory

  NodeObj* temp_curr = (*ptr)->head->next;

  for (int i = 0; i < (*ptr)->size; i++) {
    NodeObj* temp = temp_curr;
    free(temp_curr->key);
    free(temp_curr->value);
    temp_curr = temp_curr->next;
    free(temp);
  }
  free((*ptr)->head);
  free((*ptr)->tail);
  free(*ptr);
  *ptr = NULL;
}

int kvs_lru_set(kvs_lru_t* kvs_lru, const char* key, const char* value) {
  // if capacity is 0
  if (kvs_lru->capacity == 0) {
    return kvs_base_set(kvs_lru->kvs_base, key, value);
  }

  NodeObj* curr = kvs_lru->head->next;

  // already exists in cache and we are updating
  while (curr != kvs_lru->tail) {
    if (strcmp(curr->key, key) == 0) {
      // update value
      free(curr->value);
      curr->value = strdup(value);
      curr->dirty = 1;

      // Move the node to the end of the LRU list
      curr->prev->next = curr->next;
      curr->next->prev = curr->prev;

      curr->next = kvs_lru->tail;
      curr->prev = kvs_lru->tail->prev;
      kvs_lru->tail->prev->next = curr;
      kvs_lru->tail->prev = curr;

      return SUCCESS;
    }
    curr = curr->next;
  }

  // if cache is full && if capacity is not 0
  if (kvs_lru->size >= kvs_lru->capacity && kvs_lru->capacity != 0) {
    NodeObj* eviction = kvs_lru->head->next;

    // evictiong of front node
    kvs_lru->head->next = eviction->next;
    eviction->next->prev = kvs_lru->head;

    // moving to disk
    if (eviction->dirty) {
      int progress =
          kvs_base_set(kvs_lru->kvs_base, eviction->key, eviction->value);
      if (progress == FAILURE) {
        return FAILURE;
      }
    }

    // Free the memory of the evicted node
    free(eviction->key);
    free(eviction->value);
    free(eviction);

    kvs_lru->size--;
  }

  // Create a new node
  NodeObj* new_node = node_create(key, value);
  new_node->dirty = 1;

  // Add the new node to the end of list
  new_node->next = kvs_lru->tail;
  new_node->prev = kvs_lru->tail->prev;
  kvs_lru->tail->prev->next = new_node;
  kvs_lru->tail->prev = new_node;

  kvs_lru->size++;
  return SUCCESS;
}

int kvs_lru_get(kvs_lru_t* kvs_lru, const char* key, char* value) {
  // TODO: implement this function

  // if capacity is 0
  if (kvs_lru->capacity == 0) {
    return kvs_base_get(kvs_lru->kvs_base, key, value);
  }

  NodeObj* curr = kvs_lru->head->next;

  // check to see if it already exists in the cache
  while (curr != kvs_lru->tail) {
    if (strcmp(curr->key, key) == 0) {
      // Move the found node to the end list
      // because newer now
      curr->prev->next = curr->next;
      curr->next->prev = curr->prev;
      curr->next = kvs_lru->tail;
      curr->prev = kvs_lru->tail->prev;
      kvs_lru->tail->prev->next = curr;
      kvs_lru->tail->prev = curr;

      // Copy the value to the provided buffer
      strcpy(value, curr->value);
      return SUCCESS;
    }
    curr = curr->next;
  }

  // if key is not in cache
  int disk_val = kvs_base_get(kvs_lru->kvs_base, key, value);

  if (disk_val == SUCCESS) {
    kvs_lru_set(kvs_lru, key, value);
  } else {
    return FAILURE;
  }

  // mark as not dirty
  curr = kvs_lru->head->next;
  while (curr != kvs_lru->tail) {
    if (strcmp(curr->key, key) == 0) {
      curr->dirty = 0;
    }
    curr = curr->next;
  }
  return SUCCESS;
}

int kvs_lru_flush(kvs_lru_t* kvs_lru) {
  // TODO: implement this function

  NodeObj* curr = kvs_lru->head->next;

  // Iterate through all entries in the cache
  while (curr != kvs_lru->tail) {
    if (curr->dirty == 1) {
      // add the entry to the disk
      int progress = kvs_base_set(kvs_lru->kvs_base, curr->key, curr->value);
      if (progress == FAILURE) {
        return FAILURE;
      }

      // Mark the flushed node as not dirty
      curr->dirty = 0;
    }
    curr = curr->next;
  }

  return SUCCESS;
}
