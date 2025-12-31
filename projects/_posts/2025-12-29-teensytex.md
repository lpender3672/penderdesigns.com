---
layout: post
title: LaTeX Rendering on Teensy with MicroTeX
category: projects
image: /assets/img/projects/teensytex/IMG_3160.jpeg
---

A small lazy project rendering MicroTeX to a TFT display with OpenFontRender

<!--more-->
The font size, position and colour can all be easily changed.
The big thing here though is that its rendered at runtime.

The following code produces the image below:
```cpp
LaTeX::init("/res");

Serial.println("Parsing LaTeX...");

auto render = LaTeX::parse(
    LR"(\frac{d}{dt}
        \begin{bmatrix}
        x \\ \dot{x} \\ l\phi \\ \dot{l\phi}
        \end{bmatrix} = \begin{bmatrix}
         0 & 1 & 0 & 0 \\
         0 & 0 & \omega_0^2 - \omega_1^2 & 0 \\
         0 & 0 & 0 & 1 \\
         0 & 0 & \omega_0^2 & 0
        \end{bmatrix} )", // LaTeX code
    TFT_WIDTH,
    20,     // font size (in point)
    10,     // space between 2 lines (in pixel)
    WHITE   // foreground color
);

if (render) {
    Serial.printf("Render size: %d x %d\n", render->getWidth(), render->getHeight());

    OpenFontRender ofr;
    ofr.setSerial(Serial);
    ofr.setDrawer(tft);
    Graphics2D_tft g2d(&tft, &ofr);
    render->draw(g2d, 0, 100);  // Draw at position (0, 0)
} else {
    Serial.println("Failed to parse LaTeX");
}
```

![](/assets/img/projects/teensytex/IMG_3172.jpeg)

Theres still some issues of course like the middle line of right brackets but overall its pretty neat.

![](/assets/img/projects/teensytex/IMG_3170.jpeg)

This used the following libraries:
- MicroTeX
- tinyxml2
- OpenFontRender
- bodmer/TFT_eSPI
- Teensy SD file library to load the fonts

The MicroTeX library was lazily modified to correctly load fonts and handle cases where exceptions were deliberately thrown and caught.
Then to get it to compile with gcc-arm-none-eabi it also needed flags -std=gnu++17 -fno-exceptions -fno-rtti.
A custom  linker script for the teensy was also made as the program compiled to just over 1MB wouldnt fit on the teensys ITCM memory.

