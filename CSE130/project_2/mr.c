#include "mr.h"

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "hash.h"
#include "kvlist.h"

// making a struct to accept 3 essential informations
typedef struct map_pack {
  kvlist_t* input;
  kvlist_t* output;
  mapper_t* func;
} map_pack;

// calling mapper with the 3 desired arguments
void* map_func(void* arg) {
  map_pack* pack = arg;
  kvlist_iterator_t* itor = kvlist_iterator_new(pack->input);
  kvpair_t* unpack;
  // kvlist_print(2, pack->input);
  for (unpack = kvlist_iterator_next(itor); unpack != NULL;
       unpack = kvlist_iterator_next(itor)) {
    (*(pack->func))(unpack, pack->output);
  }
  // free itor
  kvlist_iterator_free(&itor);
  return NULL;
}

// making a struct for the reduction to accept 3 essential info
typedef struct reduc_pack {
  kvlist_t* input;
  kvlist_t* output;
  reducer_t* func;
} reduc_pack;

// calling reducer with the 3 desired arguments
void* reduc_func(void* arg) {
  reduc_pack* pack = arg;

  kvlist_sort(pack->input);
  kvlist_iterator_t* itor = kvlist_iterator_new(pack->input);
  kvlist_t* final_output = kvlist_new();
  kvpair_t* pear = kvlist_iterator_next(itor);
  // kvlist_print(2, pack->input);
  char* word;
  // if there is nothing in pear
  if (pear == NULL) {
    kvlist_iterator_free(&itor);
    kvlist_free(&final_output);
    return (NULL);
  }

  // while there is something more
  for (word = pear->key; pear != NULL; pear = kvlist_iterator_next(itor)) {
    // fprintf(stderr, "looping in reduc func\n");
    // if the next and current word are the same, append them
    if (strcmp(word, pear->key) == 0) {
      kvlist_append(final_output, kvpair_clone(pear));
    } else {
      (*(pack->func))(word, final_output, pack->output);
      kvlist_free(&final_output);   // free final output
      final_output = kvlist_new();  // realloc final_output
      kvlist_append(final_output, kvpair_clone(pear));
      word = pear->key;
    }
  }
  (*(pack->func))(word, final_output, pack->output);
  // freeing calloc'd variables
  kvlist_iterator_free(&itor);
  kvlist_free(&final_output);

  return NULL;
}

void map_reduce(mapper_t mapper, size_t num_mapper, reducer_t reducer,
                size_t num_reducer, kvlist_t* input, kvlist_t* output) {
  // -------Split Phase-------
  // Split the input list into num_mapper smaller lists.

  // initializing the various mapper inputs and outputs
  kvlist_t** in_map = calloc(num_mapper, sizeof(kvlist_t*));

  for (size_t i = 0; i < num_mapper; i++) {
    in_map[i] = kvlist_new();
  }

  // iterating through the input and putting into the in and out
  kvlist_iterator_t* itor = kvlist_iterator_new(input);
  int counter = 0;
  kvpair_t* separate;

  // no more to read
  for (separate = kvlist_iterator_next(itor); separate != NULL;
       separate = kvlist_iterator_next(itor)) {
    kvlist_append(in_map[counter], kvpair_clone(separate));
    counter++;
    counter = counter % num_mapper;  // sending in_map to the allocated lists
  }

  // free itor
  kvlist_iterator_free(&itor);

  // ------Map Phase------
  // Spawn num_mapper threads and execute the provided map function.

  // initializing output mapper
  kvlist_t** out_map = calloc(num_mapper, sizeof(kvlist_t*));

  for (size_t i = 0; i < num_mapper; i++) {
    out_map[i] = kvlist_new();
  }

  pthread_t* threading = calloc(num_mapper, sizeof(pthread_t*));
  map_pack** mp_array = calloc(num_mapper, sizeof(map_pack*));

  for (size_t i = 0; i < num_mapper; i++) {
    map_pack* mp = calloc(1, sizeof(map_pack));
    mp->func = &mapper;
    mp->input = in_map[i];
    mp->output = out_map[i];
    mp_array[i] = mp;
    pthread_create(&(threading[i]), NULL, &map_func, mp_array[i]);
  }

  // joining the threads
  for (size_t i = 0; i < num_mapper; i++) {
    pthread_join(threading[i], NULL);
  }

  // free the sorrows of my future
  for (size_t i = 0; i < num_mapper; i++) {
    free(mp_array[i]);
    kvlist_free(&(in_map[i]));
  }
  free(mp_array);
  free(in_map);

  // freeing everything
  free(threading);

  // ------Shuffle Phase------
  // Shuffle mapper results to num_reducer lists

  // initializing reducing lists
  kvlist_t** reducing = calloc(num_reducer, sizeof(kvlist_t*));
  for (size_t i = 0; i < num_reducer; i++) {
    reducing[i] = kvlist_new();
  }

  // hashing the same keys to the same mapps
  for (size_t i = 0; i < num_mapper; i++) {
    kvlist_t* mapp = out_map[i];
    itor = kvlist_iterator_new(mapp);
    kvpair_t* pear;
    while ((pear = kvlist_iterator_next(itor)) != NULL) {
      // fprintf(stderr, "looping in hash mapping\n");
      unsigned long hashing = hash(pear->key);
      unsigned long redution = hashing % num_reducer;

      kvpair_t* pearing = kvpair_clone(pear);

      kvlist_append(reducing[redution], pearing);
    }
    kvlist_iterator_free(&itor);
  }

  // freeing out_map
  for (size_t i = 0; i < num_mapper; i++) {
    kvlist_free(&(out_map[i]));
  }
  free(out_map);

  // ---- Reduce Phase ----
  // Spawn num_reducer threads and execute the provided reduce function.
  threading = calloc(num_reducer, sizeof(pthread_t*));
  kvlist_t** reduced = calloc(num_reducer, sizeof(kvlist_t*));
  for (size_t i = 0; i < num_reducer; i++) {
    reduced[i] = kvlist_new();
  }

  reduc_pack** rp_array = calloc(num_reducer, sizeof(reduc_pack*));
  for (size_t i = 0; i < num_reducer; i++) {
    // fprintf(stderr, "looping in reduce thread create\n");
    reduc_pack* rp = calloc(1, sizeof(reduc_pack));
    rp->func = &reducer;
    rp->input = reducing[i];
    rp->output = reduced[i];
    rp_array[i] = rp;
    pthread_create(&(threading[i]), NULL, &reduc_func, rp_array[i]);
  }

  // joining all of the threads
  for (size_t i = 0; i < num_reducer; i++) {
    pthread_join(threading[i], NULL);
  }

  // freeing everything
  free(threading);

  // Concat the resulting lists to get a single list.
  // looping through reduced to add the output to output
  for (size_t i = 0; i < num_reducer; i++) {
    kvlist_extend(output, reduced[i]);
  }

  // free the sorrows of my future
  for (size_t i = 0; i < num_reducer; i++) {
    free(rp_array[i]);
    kvlist_free(&(reducing[i]));
    kvlist_free(&(reduced[i]));
  }
  free(rp_array);
  free(reducing);
  free(reduced);
}
