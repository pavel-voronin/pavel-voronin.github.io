---
title: VueFakeLinux
---

::vue-fake-linux
---
files:
  - path: /root/.local/share/fz1/catalog/bash
    content: |
      Bash
      Tags: shell, interactive

      Interactive shell for this tiny x86 environment.

      > bash --help
      @ bash
      @(Login shell) bash -l
      @(Run one command) bash -lc 'uname -a'
      @(List builtins) bash -lc help
  - path: /root/.local/share/fz1/catalog/fz1
    content: |
      fz1
      Tags: shell, launcher, catalog

      Terminal catalog and picker bundled into this environment.

      > fz1 --help
      @ fz1
      @(Open shell command catalog) fz1 --catalog-dir /root/.local/share/fz1/catalog
      @(Search file commands) fz1 --catalog-dir /root/.local/share/fz1/catalog fs
      @(Search system commands) fz1 --catalog-dir /root/.local/share/fz1/catalog system
  - path: /root/.local/share/fz1/catalog/fs/cat
    content: |
      cat
      Tags: files, read

      Print file contents to stdout.

      > cat --help
      @ cat /etc/passwd
      @(Read bashrc) cat /root/.bashrc
      @(Read ls entry) cat /root/.local/share/fz1/catalog/fs/ls
  - path: /root/.local/share/fz1/catalog/fs/chmod
    content: |
      chmod
      Tags: files, permissions

      Change file permissions.

      > chmod --help
      @ chmod +x /bin/script.sh
      @(Make executable) chmod +x /tmp/run.sh
  - path: /root/.local/share/fz1/catalog/fs/cp
    content: |
      cp
      Tags: files, copy

      Copy files inside the writable overlay.

      > cp --help
      @ cp /root/.bashrc /tmp/bashrc.copy
      @(Copy catalog tree) cp -R /root/.local/share/fz1/catalog /tmp/catalog.copy
      @(Backup bashrc) cp /root/.bashrc /tmp/bashrc.bak
  - path: /root/.local/share/fz1/catalog/fs/ls
    content: |
      ls
      Tags: files, listing

      List directory contents via busybox.

      > ls --help
      @ ls
      @(Long listing) ls -l
      @(Include dotfiles) ls -la
      @(List root) ls /
      @(List catalog) ls /root/.local/share/fz1/catalog
  - path: /root/.local/share/fz1/catalog/fs/mkdir
    content: |
      mkdir
      Tags: files, create

      Create directories in the writable overlay.

      > mkdir --help
      @ mkdir /tmp/work
      @(Nested path) mkdir -p /tmp/work/logs
      @(Scratch catalog dir) mkdir -p /tmp/catalog-test/network
  - path: /root/.local/share/fz1/catalog/fs/pwd
    content: |
      pwd
      Tags: files, path

      Print the current working directory.

      > pwd --help
      @ pwd
      @(Print inside tmp) bash -lc 'cd /tmp && pwd'
      @(Print catalog dir) bash -lc 'cd /root/.local/share/fz1/catalog && pwd'
  - path: /root/.local/share/fz1/catalog/fs/rm
    content: |
      rm
      Tags: files, delete

      Remove files and directories.

      > rm --help
      @ rm /tmp/bashrc.copy
      @(Recursive delete) rm -rf /tmp/catalog.copy
      @(Clean work dir) rm -rf /tmp/work
  - path: /root/.local/share/fz1/catalog/system/clear
    content: |
      clear
      Tags: system, terminal

      Clear the terminal screen.

      > clear --help
      @ clear
  - path: /root/.local/share/fz1/catalog/system/env
    content: |
      env
      Tags: system, environment

      Print environment variables.

      > env --help
      @ env
      @(Show shell vars) env | sort
  - path: /root/.local/share/fz1/catalog/system/tty
    content: |
      tty
      Tags: system, terminal

      Print the terminal device name.

      > tty --help
      @ tty
  - path: /root/.local/share/fz1/catalog/system/uname
    content: |
      uname
      Tags: system, kernel

      Print kernel and machine information from the guest.

      > uname --help
      @ uname
      @(Kernel and arch) uname -a
      @(Machine only) uname -m
  - path: /bin/fz1
    url: /vue-fake-linux/fz1
    mode: "0777"
run:
  - "printf 'Press <Ctrl+x g> to open fz1 and insert the selected command\\n\\n'"
  - export PATH=/usr/local/bin:/usr/bin:/bin
  - /bin/fz1 integration bash > /etc/fz1.bash
  - cat <<'EOF' > /root/.bashrc
  - export PATH=/usr/local/bin:/usr/bin:/bin
  - source /etc/fz1.bash
  - "export PS1='\\w # '"
  - EOF
  - exec /bin/bash --noprofile --rcfile /root/.bashrc -i
---
