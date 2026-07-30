---
layout: post
title: Oscilloscope Tools over MCP
category: projects
image: /assets/img/projects/mcp_hardware_tools/bench.jpg
---

An MCP server that lets Claude drive my oscilloscope, so it can set the thing up, take a capture, work out whether the
capture is any good and go again if it isnt.

<!--more-->

Source: [lpender3672/mcp-hardware-tools](https://github.com/lpender3672/mcp-hardware-tools)

This started because of the [drive system](/projects/2026-02-02-drive_system/), and because I've been doing electrochemical
impedance spectroscopy at work. Debugging the drive system means looking at phase currents and encoder signals, and EIS is
the same sort of job of putting a known signal in and measuring what comes back out. Both of them want the scope set up
properly and the numbers pulled off it into software rather than read off the screen, so it seemed worth automating.

## What it does

The scope is a Rigol DS1054Z driven over SCPI. Theres a driver for the channel setup, timebase, trigger and acquisition
and for pulling the raw waveform off it. On top of that there are nine tools, which are acquire, describe and triage,
decoders for UART, SPI and I2C, and a few for managing the captures its already taken.

The cool thing is that Claude can tell when its own setup is wrong. A script that just captures assumes you already know
the right trigger level and timebase, which on a signal you havent seen before you dont. So every tool hands back the
state you need to pick the next move, like whether the channel is clipping, whether it actually triggered, and whether
the sample rate is high enough for whats on the wire. Then it changes something and captures again until the capture is
usable. Thats the loop and its the whole point of the thing.

The decoders are pure functions over sample arrays with nothing in them that talks to the scope, so most of the logic can
be tested with no hardware plugged in at all.

## Testing setups

This was largely written by a supervised Claude, working from the instrument manuals and from rapid feedback probing the
instruments both individually and in tandem.

To trust any of it you need signals where you already know the answer. So theres a JDS6600 signal generator for the
analog side and a Pi Pico 2 for the digital side. A small PIO program clocks precomputed sample buffers out onto the
pins, so the protocol timing gets worked out in software and PIO just plays it back. You tell it to send 0xA5 over SPI
and then check the whole chain of capture, autoscale, trigger and decode gives you 0xA5 back. Thats the first Rust
firmware Ive written, and probably not the last.

Theres 260 tests. Most run natively against a simulated scope, then theres a set of contract tests that every driver has
to pass the same way, and a set that only run with the bench actually plugged in.

The bench is below, with the scope on top and the signal generator underneath it.

![](/assets/img/projects/mcp_hardware_tools/bench.jpg)

## Whats next

Next is a driver for a better signal generator. Theres a DG1062 at work that does proper noise and much longer arbitrary
waveforms than the JDS6600 will manage. Push flat noise into something and measure what comes back and you get the whole
frequency response in one go, instead of sweeping a sine through it point by point. Sweeping is still the better way if
you care about signal to noise, because all the energy sits at the one frequency youre measuring rather than spread
across the band, so its worth being able to do it either way.

With the scope on the other end thats most of a homemade LCR meter, which is the next thing. I just need to solder up an
op-amp circuit and calibrate its response first.

The long arbitrary waveforms go further than that though. With enough points you can define an exact power spectral
density and replay it deterministically, so you pick how much energy goes in at every frequency and get the same signal
every time, instead of taking whatever a noise source happens to give you and averaging until the estimate settles. I
would also like to see if I can play a song with it.
