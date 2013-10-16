#!/bin/bash
trap 'kill $(jobs -pr)' SIGINT SIGTERM EXIT

# download large text file
if [ ! -f big.txt ]; then
	wget http://norvig.com/big.txt
fi


#start stich server, redirect output to file
node server.js > piped-big.txt &
sleep 2

#pipe large file via stitch protocol 
cat big.txt | node client.js

#compare original and piped file
md5sum big.txt
md5sum piped-big.txt


