#!/bin/sh
set -e

case $1 in
  1|2)
    if ! getent group "<%= group %>" >/dev/null; then
      groupadd -r "<%= group %>"
    fi

    if ! getent passwd "<%= user %>" >/dev/null; then
      useradd -r -g "<%= group %>" -M -s /sbin/nologin \
      -c "kibana service user" "<%= user %>"
    fi
  ;;

  *)
      echo "post install script called with unknown argument \`$1'" >&2
      exit 1
  ;;
esac

chown -R <%= user %>:<%= group %> <%= optimizeDir %>
chown <%= user %>:<%= group %> <%= dataDir %>
chown <%= user %>:<%= group %> <%= pluginsDir %>
