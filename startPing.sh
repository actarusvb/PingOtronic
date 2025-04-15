#!/bin/bash
RUNDIR="/home/ingestor/ingestor"

echo $RUNDIR
export TZ=UTC
killall -q ping

echo "RESTART!" | mosquitto_pub -l -t pingOtronic/ping

if  [[ -f $RUNDIR/ingestor.run ]];
then
	# echo STARTING....
	echo "STARTING Host Loaded!" | mosquitto_pub -l -t pingOtronic/ping

	awk '!seen[$0]++' $RUNDIR/hostNames.txt | sort > /tmp/hostNames.txt
	readarray  -t listOfHosts < /tmp/hostNames.txt
	for line in "${listOfHosts[@]}"
	do
		hostShort="${line#"${line%%[![:space:]]*}"}" 
		if [[ -n "$hostShort" && ${hostShort:0:1} != '#' ]];
		then
			read -ra hostArr <<< "$hostShort"
			size=1350;
			comment="";
			name="";
			ipAddr=${hostArr[0]};
			for a in "${hostArr[@]}";
			do
				# echo $a
				case $a in
				 -s=*      ) size=${a#"-s="};;
				 -c=*      ) comment=${a#"-c="};;
				 -n=*      ) name=${a#"-n="};;	 
				esac
			done
			echo "START ping" $size $ipAddr | mosquitto_pub -l -t pingOtronic/ping
			ping -D  -s $size $ipAddr | mosquitto_pub -l -t pingOtronic/ping &
		fi
	done
fi

