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

systemd_target= "/usr/lib/systemd/system"
sysv_target="/etc/init.d"
if [ -d $systemd_target ] && then
  echo -n "Installing systemd service..."
  cp "<%= serviceDir %>/systemd/kibana.service" "$syv_target/kibana.service"
  echo -n "done."
elif [ -d $sysv_target ]; then
  echo -n "Installing sysv service..."
  cp "<%= serviceDir %>/sysv/kibana" "$sysv_target/kibana"
  echo -n "done."
else
  echo "No system service found, check <%= serviceDir %> to manually install."
fi
