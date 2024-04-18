#include <err.h>
#include <fcntl.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define BLOCK 4096

int main(int argc, char *argv[]) {
  // buffer
  char buff[BLOCK];
  bool flag = false;

  // if blank
  if (argc == 1) {
    int red;
    while ((red = read(0, buff, BLOCK))) {
      // if invalid read
      if (red < 0) {
        warn("-");
        return (1);
      }
      int wrt = write(1, buff, red);
      // if invalid write
      if (wrt < 0) {
        warn("write error");
        return (1);
      }
    }
  }

  for (int i = 1; i < argc; i++) {
    // if its a stdin input (-)
    if (strcmp(argv[i], "-") == 0) {
      int red;
      while ((red = read(0, buff, BLOCK))) {
        // if invalid read
        if (red < 0) {
          warn("-");
          flag = true;
          break;
        }
        int wrt = write(1, buff, red);
        // if invalid write
        if (wrt < 0) {
          warn("write error");
          flag = true;
          break;
        }
      }

      // file input
    } else {
      // open files for reading and writing
      int fd = open(argv[i], O_RDONLY);

      // if (file == NULL) {
      if (fd < 0) {
        warn("%s", argv[i]);
        flag = true;

      } else {
        // outputting file
        int red;
        while ((red = read(fd, buff, BLOCK))) {
          // if invalid read
          if (red < 0) {
            warn("%s", argv[i]);
            flag = true;
            break;
          }

          int wrt = write(1, buff, red);
          // if invalid write
          if (wrt < 0) {
            warn("write error");
            flag = true;
            break;
          }
        }
        close(fd);
      }
    }
  }

  if (flag) {
    return (1);
  }

  return EXIT_SUCCESS;
}
