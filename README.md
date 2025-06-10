# PingOtronic
A ping Ingestor 

# PingOtronic
## What is PingOtronic
This is a ping monitoring tools for debug network issue in complex network.

Targets will be pinged (icmp echo request & icmp echo response) using PingOtronc host's (linux debian machine) (no satellite & console yet) ping for packet size defined for each Host.

Pings will be at 1 second cadence.

Ping response are stored in local postgresql database.

1 minute is like to 60 pings, 1 hour 3600 and 1 day 86400 ping for each host.

200 target mean about 15 Milion of records each day.

200 target also mean lot of traffic from your host to destination target

All of These may be/lead performance problem on low bandwith links

##  Why this name
This is a tribute to the mid '70 console game. It was called Ping-o-tronic (https://it.wikipedia.org/wiki/Ping-o-tronic & https://en.wikipedia.org/wiki/Ping-O-Tronic).
There is nothing more than a tribute to that console, it was a game and pingOtronic is a network tools.
We use "Ingestor" as name.

## How To
After installation you may connect using a moderm web browser to address and port where applicaion is attached. Selecting "Manage HostFile" you can add/remove targets

Host file is read every 5 minutes on the clock.

You have to manully add a super user into your mongodb dedicate collection for users. then when logged suing syper user account you maty create new users with different role.

## Tobe Done
Data Retention.... how long you want to keep your data in DB?

At this moment PingOtronic do not clean & remove old records from DB, this will lead to problem and slow down web pages

Please fell free to consider max data retention removing data form DB tables and/or moving in separate tables

## Support
Professional services for installation, turn-on key solution, authertication, add-on etc are available. Please contact us for discuss about this!.

## How is Done
node+node-express+postgresql+mosquitto+bash script+crontab
Users are stored into a mondodb collection.

In a dedicate linux box (we use Debian)

cron execute every 5 minute a bash script.

Bash script kill al pings active and start new ones, 
Every ping pipe output to a mosquitto topic.

One javascript script listen to mosquitto topic and save data

An other javascript script listen to mosquitto topics and rise error/save a record in case of ping is not replayed

a set of web pages running under Node/express give access to data
