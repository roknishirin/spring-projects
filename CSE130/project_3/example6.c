#include <pthread.h>
#include <stdio.h>
#include <unistd.h>
#include "dining.h"
#include "utils.h"
int main(void) {
dining_t* d3 = dining_init(3);
dining_t* d1 = dining_init(1);
student_t student3001 = make_student(3001, d3);
student_t student3002 = make_student(3002, d3);
student_t student3003 = make_student(3003, d3);
cleaning_t cleaning1001 = make_cleaning(1001, d1);
student_t student3004 = make_student(3004, d3);
cleaning_t cleaning3001 = make_cleaning(3001, d3);
pthread_create(&cleaning3001.thread, NULL, cleaning_enter, &cleaning3001);
dining_t* d2 = dining_init(4);
student_t student2001 = make_student(2001, d2);
cleaning_t cleaning1002 = make_cleaning(1002, d1);
student_t student2002 = make_student(2002, d2);
cleaning_t cleaning1003 = make_cleaning(1003, d1);
student_t student2003 = make_student(2003, d2);
pthread_join(cleaning3001.thread, NULL);
msleep(100);
student_t student2004 = make_student(2004, d2);
student_t student2005 = make_student(2005, d2);
cleaning_t cleaning1004 = make_cleaning(1004, d1);
pthread_create(&cleaning3001.thread, NULL, cleaning_leave, &cleaning3001);
pthread_create(&student3001.thread, NULL, student_enter, &student3001);
msleep(100);
pthread_create(&cleaning1001.thread, NULL, cleaning_enter, &cleaning1001);
msleep(100);
pthread_join(cleaning1001.thread, NULL);
pthread_join(cleaning3001.thread, NULL);
pthread_create(&student3002.thread, NULL, student_enter, &student3002);
pthread_create(&cleaning1002.thread, NULL, cleaning_enter, &cleaning1002);
msleep(100);
student_t student2006 = make_student(2006, d2);
pthread_create(&cleaning1001.thread, NULL, cleaning_leave, &cleaning1001);
pthread_join(cleaning1001.thread, NULL);
pthread_join(student3001.thread, NULL);
pthread_join(cleaning1002.thread, NULL);
pthread_create(&cleaning1002.thread, NULL, cleaning_leave, &cleaning1002);
pthread_join(student3002.thread, NULL);
pthread_join(cleaning1002.thread, NULL);
pthread_create(&cleaning1003.thread, NULL, cleaning_enter, &cleaning1003);
pthread_create(&student3003.thread, NULL, student_enter, &student3003);
student_t student2007 = make_student(2007, d2);
msleep(100);
msleep(100);
pthread_join(student3003.thread, NULL);
pthread_create(&student3004.thread, NULL, student_enter, &student3004);
pthread_create(&student3002.thread, NULL, student_leave, &student3002);
cleaning_t cleaning2001 = make_cleaning(2001, d2);
cleaning_t cleaning2002 = make_cleaning(2002, d2);
pthread_join(student3004.thread, NULL);
pthread_join(student3002.thread, NULL);
pthread_join(cleaning1003.thread, NULL);
msleep(100);
pthread_create(&cleaning1003.thread, NULL, cleaning_leave, &cleaning1003);
pthread_create(&student3003.thread, NULL, student_leave, &student3003);
msleep(100);
msleep(100);
pthread_join(cleaning1003.thread, NULL);
pthread_join(student3003.thread, NULL);
pthread_create(&cleaning1004.thread, NULL, cleaning_enter, &cleaning1004);
cleaning_t cleaning2003 = make_cleaning(2003, d2);
cleaning_t cleaning2004 = make_cleaning(2004, d2);
pthread_create(&student3004.thread, NULL, student_leave, &student3004);
pthread_join(student3004.thread, NULL);
pthread_join(cleaning1004.thread, NULL);
cleaning_t cleaning2005 = make_cleaning(2005, d2);
pthread_create(&student2001.thread, NULL, student_enter, &student2001);
pthread_join(student2001.thread, NULL);
msleep(100);
pthread_create(&cleaning2001.thread, NULL, cleaning_enter, &cleaning2001);
pthread_create(&student2001.thread, NULL, student_leave, &student2001);
msleep(100);
pthread_create(&cleaning1004.thread, NULL, cleaning_leave, &cleaning1004);
msleep(100);
pthread_create(&student3001.thread, NULL, student_leave, &student3001);
msleep(100);
pthread_join(cleaning1004.thread, NULL);
dining_destroy(&d1);
pthread_join(student2001.thread, NULL);
pthread_join(cleaning2001.thread, NULL);
pthread_join(student3001.thread, NULL);
pthread_create(&cleaning2002.thread, NULL, cleaning_enter, &cleaning2002);
msleep(100);
pthread_create(&cleaning2001.thread, NULL, cleaning_leave, &cleaning2001);
pthread_join(cleaning2001.thread, NULL);
pthread_join(cleaning2002.thread, NULL);
dining_destroy(&d3);
pthread_create(&cleaning2003.thread, NULL, cleaning_enter, &cleaning2003);
pthread_create(&cleaning2002.thread, NULL, cleaning_leave, &cleaning2002);
msleep(100);
pthread_join(cleaning2002.thread, NULL);
pthread_join(cleaning2003.thread, NULL);
pthread_create(&cleaning2003.thread, NULL, cleaning_leave, &cleaning2003);
msleep(100);
pthread_join(cleaning2003.thread, NULL);
pthread_create(&student2002.thread, NULL, student_enter, &student2002);
pthread_create(&student2003.thread, NULL, student_enter, &student2003);
pthread_join(student2002.thread, NULL);
msleep(100);
pthread_join(student2003.thread, NULL);
pthread_create(&student2003.thread, NULL, student_leave, &student2003);
pthread_join(student2003.thread, NULL);
pthread_create(&student2002.thread, NULL, student_leave, &student2002);
pthread_create(&cleaning2004.thread, NULL, cleaning_enter, &cleaning2004);
msleep(100);
pthread_join(student2002.thread, NULL);
pthread_join(cleaning2004.thread, NULL);
pthread_create(&cleaning2005.thread, NULL, cleaning_enter, &cleaning2005);
pthread_create(&cleaning2004.thread, NULL, cleaning_leave, &cleaning2004);
pthread_join(cleaning2004.thread, NULL);
msleep(100);
pthread_join(cleaning2005.thread, NULL);
pthread_create(&student2004.thread, NULL, student_enter, &student2004);
pthread_create(&cleaning2005.thread, NULL, cleaning_leave, &cleaning2005);
msleep(100);
pthread_join(cleaning2005.thread, NULL);
pthread_create(&student2005.thread, NULL, student_enter, &student2005);
msleep(100);
pthread_join(student2004.thread, NULL);
pthread_join(student2005.thread, NULL);
pthread_create(&student2005.thread, NULL, student_leave, &student2005);
msleep(100);
pthread_join(student2005.thread, NULL);
pthread_create(&student2004.thread, NULL, student_leave, &student2004);
pthread_join(student2004.thread, NULL);
msleep(100);
pthread_create(&student2006.thread, NULL, student_enter, &student2006);
msleep(100);
pthread_join(student2006.thread, NULL);
pthread_create(&student2007.thread, NULL, student_enter, &student2007);
msleep(100);
pthread_join(student2007.thread, NULL);
pthread_create(&student2006.thread, NULL, student_leave, &student2006);
msleep(100);
pthread_join(student2006.thread, NULL);
pthread_create(&student2007.thread, NULL, student_leave, &student2007);
msleep(100);
pthread_join(student2007.thread, NULL);
dining_destroy(&d2);
}
