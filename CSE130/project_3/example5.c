// reason for broadcasting to work -- phuong and sarah did it

#include <pthread.h>
#include <stdio.h>
#include <unistd.h>

#include "dining.h"
#include "utils.h"

// extra credit scenario
// student-enter should be blocked after cleaner ques up

int main(void) {
  dining_t* d = dining_init(3);

  student_t student1 = make_student(1, d);
  student_t student2 = make_student(2, d);
  student_t student3 = make_student(3, d);
  student_t student4 = make_student(4, d);
  cleaning_t cleaning = make_cleaning(1, d);
  // cleaning_t cleaning_2 = make_cleaning(2, d);

  // student 1 comes in, can enter
  student_enter(&student1);
  student_enter(&student2);
  student_enter(&student3);
  msleep(100);

  pthread_create(&cleaning.thread, NULL, cleaning_enter, &cleaning);
  msleep(100);

  pthread_create(&student4.thread, NULL, student_enter, &student4);
  msleep(100);

  student_leave(&student1);
  msleep(100);

  student_leave(&student2);
  msleep(100);

  student_leave(&student3);
  msleep(100);

  cleaning_leave(&cleaning);
  msleep(100);

  pthread_join(student4.thread, NULL);

  // student_leave(&student4);
  // msleep(100);

  dining_destroy(&d);
}
