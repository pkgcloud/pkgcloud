#!/bin/bash
# Make sure you use a username that is lowercase. 
USERNAME=$1
echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers