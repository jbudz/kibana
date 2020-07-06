#!/bin/sh
set -e

export KBN_PATH_CONF=${KBN_PATH_CONF:-<%= configDir %>}

case $1 in
  # Debian
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

  # Red Hat
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

# todo: requires keystore writes to /etc/kibana
#if [ ! -f "${KBN_PATH_CONF}"/kibana.keystore ]; then
    #/usr/share/kibana/bin/kibana-keystore --allow-root create
    #chown root:kibana "${KBN_PATH_CONF}"/kibana.keystore
    #chmod 660 "${KBN_PATH_CONF}"/kibana.keystore
    #md5sum "${KBN_PATH_CONF}"/kibana.keystore > "${KBN_PATH_CONF}"/.kibana.keystore.initial_md5sum
#fi
