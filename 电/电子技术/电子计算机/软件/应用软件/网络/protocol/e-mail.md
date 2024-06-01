# 电子邮件

## SMTP

[SMTP](https://www.rfc-editor.org/rfc/rfc5321) 的全称是简单邮件传输协议（Simple Mail Transfer Protocol），它用于计算机之间的邮件传输，邮件服务器称为邮箱，客户端可以通过 SMTP 要求已登录的邮箱向目标邮箱发送邮件，邮箱之间的邮件传输也使用 SMTP。

## 域名系统

邮箱必须拥有一个主域名和一个服务器自身的域名，比如 163.com 和 mail.163.com，并且需要给主域名注册一个 MX 记录用于告知邮箱的地址，以 163 邮箱为例，它的 MX 记录如下：

```bash
$ dig @114.114.114.114 MX 163.com

; <<>> DiG 9.18.11 <<>> @114.114.114.114 MX 163.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 17988
;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;163.com.			IN	MX

;; ANSWER SECTION:
163.com.		9217	IN	MX	10 163mx01.mxmail.netease.com.
163.com.		9217	IN	MX	50 163mx00.mxmail.netease.com.
163.com.		9217	IN	MX	10 163mx03.mxmail.netease.com.
163.com.		9217	IN	MX	10 163mx02.mxmail.netease.com.

;; Query time: 20 msec
;; SERVER: 114.114.114.114#53(114.114.114.114) (UDP)
;; WHEN: Sat Mar 18 09:25:17 CST 2023
;; MSG SIZE  rcvd: 136
```

ANSWER SECTION 中的内容就是可用的邮箱地址，可以通过那些域名获取邮箱的 IP 地址：

```bash
$ dig @114.114.114.114 163mx01.mxmail.netease.com

; <<>> DiG 9.18.11 <<>> @114.114.114.114 163mx01.mxmail.netease.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 9566
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;163mx01.mxmail.netease.com.	IN	A

;; ANSWER SECTION:
163mx01.mxmail.netease.com. 586	IN	A	220.181.12.117

;; Query time: 23 msec
;; SERVER: 114.114.114.114#53(114.114.114.114) (UDP)
;; WHEN: Sat Mar 18 09:27:06 CST 2023
;; MSG SIZE  rcvd: 71
```

