#include "dining.h"

#include <pthread.h>
#include <semaphore.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct dining {
  // TODO: Add your variables here
  int capacity;

  // my variables
  int num_students;
  int num_cleaners;
  int cleaning_queue;
  pthread_mutex_t mutex;
  sem_t student_sem;
  sem_t cleaner_sem;
  pthread_cond_t cleaning_can_enter;
  pthread_cond_t cleaning_done;

} dining_t;

dining_t *dining_init(int capacity) {
  // TODO: Initialize necessary variables
  dining_t *dining = malloc(sizeof(dining_t));
  dining->capacity = capacity;

  // initializing new variables
  dining->num_students = 0;
  dining->num_cleaners = 0;
  dining->cleaning_queue = 0;

  pthread_mutex_init(&dining->mutex, NULL);

  sem_init(&dining->student_sem, 0, capacity);  // assign sem to capacity
  sem_init(&dining->cleaner_sem, 0, 1);         // one cleaner at a time

  pthread_cond_init(&dining->cleaning_can_enter, NULL);
  pthread_cond_init(&dining->cleaning_done, NULL);

  return dining;
}

// no students and no ongoing cleaning
void dining_destroy(dining_t **dining) {
  // TODO: Free dynamically allocated memory

  pthread_mutex_destroy(&(*dining)->mutex);

  sem_destroy(&(*dining)->student_sem);
  sem_destroy(&(*dining)->cleaner_sem);

  pthread_cond_destroy(&(*dining)->cleaning_done);
  pthread_cond_destroy(&(*dining)->cleaning_can_enter);

  free(*dining);
  *dining = NULL;
}

void dining_student_enter(dining_t *dining) {
  // TODO: Your code goes here
  // ensuring no more come in
  sem_wait(&dining->student_sem);
  pthread_mutex_lock(&dining->mutex);
  while (dining->num_cleaners > 0 || dining->cleaning_queue > 0) {
    pthread_cond_wait(&dining->cleaning_done, &dining->mutex);
  }
  dining->num_students++;
  pthread_mutex_unlock(&dining->mutex);
}

void dining_student_leave(dining_t *dining) {
  // TODO: Your code goes here
  pthread_mutex_lock(&dining->mutex);
  dining->num_students--;
  pthread_mutex_unlock(&dining->mutex);
  // signalling that student_leave has been called
  if (dining->num_students == 0)
    pthread_cond_broadcast(&dining->cleaning_can_enter);
  sem_post(&dining->student_sem);
}

void dining_cleaning_enter(dining_t *dining) {
  // TODO: Your code goes here
  dining->cleaning_queue++;
  sem_wait(&dining->cleaner_sem);
  pthread_mutex_lock(&dining->mutex);
  // if students already in dining hall
  while (dining->num_students > 0) {
    pthread_cond_wait(&dining->cleaning_can_enter, &dining->mutex);
  }
  dining->num_cleaners++;
  dining->cleaning_queue--;
  pthread_mutex_unlock(&dining->mutex);
}

void dining_cleaning_leave(dining_t *dining) {
  // TODO: Your code goes here
  pthread_mutex_lock(&dining->mutex);
  dining->num_cleaners--;
  pthread_mutex_unlock(&dining->mutex);
  // signalling the cleaning_leave has called
  pthread_cond_broadcast(&dining->cleaning_done);
  sem_post(&dining->cleaner_sem);
}
