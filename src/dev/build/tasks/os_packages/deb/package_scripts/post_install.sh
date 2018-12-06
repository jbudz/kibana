#!/bin/sh
set -e

case $1 in
  configure)
    if ! getent group "<%= group %>" >/dev/null; then
      addgroup --quiet --system "<%= group %>"
    fi

    if ! getent passwd "<%= user %>" >/dev/null; then
      adduser --quiet --system --no-create-home --disabled-password \
      --ingroup "<%= group %>" --shell /bin/false "<%= user %>"
    fi
  ;;
  abort-deconfigure|abort-upgrade|abort-remove)
  ;;
esac

chown -R <%= user %>:<%= group %> <%= optimizeDir %>
chown <%= user %>:<%= group %> <%= dataDir %>
chown <%= user %>:<%= group %> <%= pluginsDir %>
