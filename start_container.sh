#!/bin/bash

echo starting container...
whoami
pwd
env
# ls -alh /etc/nginx
# export INTERNAL_PORT=3737
# export PORT=4747

# erb nginx.conf.erb | tee /etc/nginx/nginx.conf
#service nginx restart


OP=${1-main}
echo ARGS: $0 $@
echo OP: $OP
case "${OP}" in
  sh|bash)
    set -- "$@"
    ;;
  main)
    exec -a gateway-www node app.js
    ;;
  help)
    cat <<-EOT
    $0 - help

    Welcome to T1Pal Nightscout Gateway WWW Dashboard Container Help
    Entry commands:
    * bash, sh - run bash
    * main - run the main dashboard web
    * help - show this help
EOT
    ;;
esac

