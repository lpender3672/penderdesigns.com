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

The board drives a motor closed loop. It used to make a horrible screeching noise and get too hot to run for more than
about a minute, which I had put down to the commutation being wrong somewhere.

That got fixed by testing it against the scope instead of guessing. The
[oscilloscope MCP tools](/projects/2026-07-26-mcp_hardware_tools/) are pulled into the firmware repo as a uv dependency,
so the hardware in the loop tests can set the scope up, capture the phase currents and encoder signals and assert on them
from pytest. Commands and telemetry go over J-Link RTT, which reads and writes target memory over SWD without halting or even slowing the core. Halting the energised power stage would release the precious magic smoke that makes it work.

With the hardware-in-loop tests in place the actual faults were findable. The rotating frame ran backwards, because the encoder counts against the commanded phase sequence and no direction sign was applied, so `iq` stopped meaning torque as soon as the shaft
turned. Standstill hides this completely, which is why alignment always looked fine. Alignment itself assumed a 20 V bus
on a board that measures its own, so the same constants meant about 15 A at 12 V and 25 A at 19 V. `dt` was hardcoded to
one PWM period while the loop actually ran at whatever rate the encoder DMA finished at, feedback was low passed at
100 Hz around a winding that responds in a few hundred microseconds, and the encoder driver had a 350 ns datasheet guard
implemented as a 1 ms tick wait.

Two of these cancelled each other out for a while. The speed estimate was taken in raw encoder counts while torque acts
in the direction corrected frame, so positive `iq` read as negative speed, and that only showed up once the alignment
offset was fixed.

It now holds a 600 rpm setpoint under a cascaded speed controller at about 2 rad/s of ripple, with the control loop
running every 100 to 150 us and the encoder watchdog silent. Motor, encoder and board constants are one set of named
objects with the rest derived at compile time, rather than seven loose literals, several of which were wrong.

The laser tachometer in the video reads 587 rpm against that 600 rpm setpoint though, so the shaft is about 2% slow and
the loop doesnt know it. The speed it is controlling to is derived from encoder counts, so if the counts per revolution
or the pole pair count are wrong then it holds its own number perfectly and the real shaft sits somewhere else. That
needs diagnosing before any of the numbers off it mean much.

Which is the general problem, the drive is still running on constants off a label rather than measured off this motor.
Inductance is the obvious one to do first as Kv cannot give it and it is what sets the proportional gain, but the
encoder counts, pole pairs and alignment offset all want measuring and checking against each other too. There also isnt
a startup self check, so a wrong alignment or torque sign runs away to 18 A instead of refusing to start.

The assembled board wired up to a BLDC motor and SPI encoder on the bench for testing.
![](/assets/img/projects/drivesys/motor.jpeg)

And the first smooth closed loop spin off it.

<iframe width="483" height="859" src="https://www.youtube.com/embed/QmeIvKenTGU" title="First (smooth) closed loop spin" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

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
