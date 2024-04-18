// og example 2

#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

#include "dining.h"
#include "utils.h"

int main(void) {
  dining_t* d = dining_init(3);

  student_t student1 = make_student(1, d);
  student_t student2 = make_student(2, d);
  cleaning_t cleaning = make_cleaning(1, d);
  cleaning_t cleaning_2 = make_cleaning(2, d);

  // student 1 comes in, can enter
  student_enter(&student1);

  // cleaning cannot enter because of student 1; this blocks
  pthread_create(&cleaning.thread, NULL, cleaning_enter, &cleaning);
  msleep(100);

  // student 1 leaves
  student_leave(&student1);

  // cleaning should begin now
  pthread_join(cleaning.thread, NULL);

  // student 2 comes in but cannot enter because the cleaning is in progress
  pthread_create(&student2.thread, NULL, student_enter, &student2);

  // 0.1 seconds later
  msleep(100);

  // cleaning completes
  cleaning_leave(&cleaning);

  // now, student 2 should be able to enter
  pthread_join(student2.thread, NULL);
  student_leave(&student2);

  cleaning_enter(&cleaning);
  pthread_create(&cleaning_2.thread, NULL, cleaning_enter, &cleaning_2);
  msleep(100);

  cleaning_leave(&cleaning);

  pthread_join(cleaning_2.thread, NULL);

  dining_destroy(&d);
}

/*#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

#include "dining.h"
#include "utils.h"

int main(void) {
  dining_t* d = dining_init(3);

  student_t student1 = make_student(1, d);
  student_t student2 = make_student(2, d);
  student_t student3 = make_student(3, d);
  student_t student4 = make_student(4, d);
  student_t student5 = make_student(5, d);
  cleaning_t cleaning = make_cleaning(1, d);
  //cleaning_t cleaning2 = make_cleaning(2, d);

  // student 1 comes in, can enter
  student_enter(&student1);
  student_enter(&student2);
  student_enter(&student3);

  // cleaning cannot enter because of student 1; this blocks
  pthread_create(&cleaning.thread, NULL, cleaning_enter, &cleaning);
  msleep(100);

  // student 1 leaves
  student_leave(&student1);
  student_leave(&student2);
  pthread_create(&student4.thread, NULL, student_enter, &student4);
  student_leave(&student3);

  // cleaning should begin now
  pthread_join(cleaning.thread, NULL);

  // student 5 comes in but cannot enter because the cleaning is in progress
  pthread_create(&student5.thread, NULL, student_enter, &student5);

  // 0.1 seconds later
  msleep(100);

  // cleaning completes
  cleaning_leave(&cleaning);

  // now, student 2 should be able to enter
  pthread_join(student4.thread, NULL);
  pthread_join(student5.thread, NULL);
  student_leave(&student4);
  student_leave(&student5);

  dining_destroy(&d);
}*/
