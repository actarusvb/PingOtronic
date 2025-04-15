#
#
# pingOtronic
#
#
#controllo coda mqtt
mosquitto_sub -t pingOtronic/ping

# start ingestor
 node index.js

# da gestire per timeout e sua identificazione
ping -D -O -s 1450 192.168.178.1
[1742459741.550234] no answer yet for icmp_seq=136
pingOtronic/ping [1742473679.387105] From 10.0.2.2 icmp_seq=3188 Destination Net Unreachable


# base ping se manuale
ping -D  -s 1450 10.0.2.2 | mosquitto_pub -l -t pingOtronic/ping


# ip hosts in file hostName.txt #for comments
./startPing.sh in crontab

To enable run
touch ingestor.run 
to stop 
rm ingestor.run


#####################################################################

select * from events where (hostip = '185.86.131.2' or hostip = '185.86.131.3' or hostip = '172.21.99.5' ) and times > now() - interval '40 hour' and rtt > 9997   order by times limit 1000;


#####################################################################

DROP TABLE public.events;
CREATE TABLE IF NOT EXISTS  public.events (
    times timestamp,
    size integer,
    hostip character(24),
    seq integer,
    ttl integer,
    rtt real
);
ALTER TABLE public.events OWNER to mqtt;

DROP TABLE public.events;

CREATE TABLE IF NOT EXISTS  public.badevents (
    times timestamp,
    size integer,
    hostip character(24),
    seq integer,
    ttl integer,
    rtt real
);