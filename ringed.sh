#!/bin/bash
source .env
if [[ ! -e "$RINGRING_FIFO" ]]; then
	echo making fifo
	mkfifo "$RINGRING_FIFO"
	(while true; do sleep 100d; done >"$RINGRING_FIFO") &disown # prevent EOF sent to fifo
fi
echo a > "$RINGRING_FIFO"
