#!/bin/bash

./client DIRECTORY CLOCK 3 <<EOF

GET file1.txt
GET file2.txt
GET file3.txt
GET file1.txt
GET file3.txt
SET file4.txt HI
GET file2.txt
SET file3.txt hello
GET file1.txt

EOF