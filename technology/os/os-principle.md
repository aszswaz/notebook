# Introduction

OS principle study notes.

# Hardware

## Interface

[**Serial port**](https://en.wikipedia.org/wiki/Serial_port)

A serial port is a port that can only transfer one bit at a time. At the end of the 20th century, its disadvantage was the slow transmission speed, but from the beginning of the 21 st century, it increased the data transmission speed by increasing the frequency of data transmission.

[**Parallel port**](https://en.wikipedia.org/wiki/Parallel_port)

A parallel port is a port that can transfer multiple bits at a time. At the end of the 20th century, its transmission speed was faster than that of the serial port , and it was widely used. But it has a flaw, it must send multiple bits of data at the same time, the multiple bits of data must also arrive at the same time, if one bit of data is lost, the multiple bits of data must be resent.

[**USB**](https://en.wikipedia.org/wiki/USB)

Serial and parallel ports have largely been replaced by USB ports. USB is essentially an improvement over serial ports, whit multiple serial ports inside its interface, called endpoints.

USB can also transfer in parallel, but is differs from a parallel port in that if data is lost during the transfer, all data does not need to be resent.

For example, if 8 bits of data are sent at same time, if one bit fails to be sent, the parallel port needs to resent the 8-bit data, while the USB only needs to resend the lost bit of data.

Each USB port has a corresponding number. The default is port 0 as the control port, which is used to transmit control commands. The USB host can specify which ports to use for transmission through commands.

