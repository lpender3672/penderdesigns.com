---
layout: post
title: Field-Oriented Motor Drive System
category: projects
image: /assets/img/projects/drivesys/board.jpg
---

A slow project to iterate a low cost FOC cycloidal drive system.

<!--more-->

The schematic and DRV8353 driver layout for the very first layout is taken from the [Open Source Motor Controller](https://github.com/GyrocopterLLC/flatmcu).
Modifications to the oscillator, swapping of micro usb to usb-c and changing the encoder to SPI were made to improve the design and lower the cost.

The first board prototype has been made and brought up.
To save money only small passive components were placed in PCB assembly.
Hand soldering of the STM32 LQFP package went ok but proved difficult for the DRV8353 which has a smaller QFN package.
Large inductors and capacitors were also a lot cheaper to buy separately but were easy to solder on.

## Status

The board does drive a motor. A small drone motor has been spun for about a minute before the driver gets too hot and has
to be stopped, so the idea works. It makes a horrible screeching noise while its running though. It shouldnt be making
any noise at all, so somethings wrong with the commutation, which would explain the heat as well.

My money is on the encoder angle calibration. It would be interesting to feed a mic into a scope and compare what comes
out of it against the set PWM and target rpm frequencies.

Work is paused at the moment as the summer has been busy.

![](/assets/img/projects/drivesys/board-cad.png)

A cycloidal gearbox has been designed
![](/assets/img/projects/drivesys/gearbox.png)

As seen below this has been fully parameterised for any future iterations and to allow for easy modification of the design.
The whole solidworks assembly is based on a template part with the parameters and cycloidal equations defined within.

$$
x(\theta) = R_p \cos(\theta) - a \cos\left(\theta + \arctan\left(\frac{\sin((1-N_t)\theta)}{\frac{R_p}{E \cdot N_t} - \cos((1-N_t)\theta)}\right)\right) - E \cos(N_t \theta)
$$

$$
y(\theta) = R_p \sin(\theta) - a \sin\left(\theta + \arctan\left(\frac{\sin((1-N_t)\theta)}{\frac{R_p}{E \cdot N_t} - \cos((1-N_t)\theta)}\right)\right) - E \sin(N_t \theta)
$$

![](/assets/img/projects/drivesys/parameterised.png)

The first iteration was printed in resin to have very high resolution but warped unexpectedly.
Future iterations of the first gearbox design will just be done in PLA until improvements from resin printing are justified.

![](/assets/img/projects/drivesys/gearbox1.jpg)
