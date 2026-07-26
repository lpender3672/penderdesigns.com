---
layout: post
title: TeX Rendering on Teensy with embedtex
category: projects
image: /assets/img/projects/teensytex/IMG_3160.jpeg
---

Rendering TeX to a TFT display on a teensy 4.1, at runtime.

<!--more-->

Source: [lpender3672/embedtex](https://github.com/lpender3672/embedtex)

This was a quick project and not much of my own effort went into it. It ended up being as much a test of what Claude
could do as it was about getting TeX onto a microcontroller.

The first go just used MicroTeX with OpenFontRender, tinyxml2, TFT_eSPI and the teensy SD library to load the fonts. The
code below produces the image after it.

```cpp
LaTeX::init("/res");

auto render = LaTeX::parse(
    LR"(\frac{d}{dt}
        \begin{bmatrix}
        x \\ \dot{x} \\ l\phi \\ \dot{l\phi}
        \end{bmatrix} = \begin{bmatrix}
         0 & 1 & 0 & 0 \\
         0 & 0 & \omega_0^2 - \omega_1^2 & 0 \\
         0 & 0 & 0 & 1 \\
         0 & 0 & \omega_0^2 & 0
        \end{bmatrix} )",
    TFT_WIDTH,
    20,     // font size (in point)
    10,     // space between 2 lines (in pixel)
    WHITE   // foreground color
);

if (render) {
    OpenFontRender ofr;
    ofr.setDrawer(tft);
    Graphics2D_tft g2d(&tft, &ofr);
    render->draw(g2d, 0, 100);
}
```

![](/assets/img/projects/teensytex/IMG_3172.jpeg)

![](/assets/img/projects/teensytex/IMG_3170.jpeg)

The MicroTeX library was modified to load the fonts correctly and to handle the cases where exceptions are deliberately
thrown and caught. Then to get it to compile with gcc-arm-none-eabi it also needed the flags `-std=gnu++17
-fno-exceptions -fno-rtti`. A custom linker script was made as well because the program compiled to just over 1MB and
wouldnt fit on the teensys ITCM memory.

It worked, but its not really the right shape for a microcontroller. MicroTeX assumes theres an OS underneath it. It owns
the heap, uses shared_ptr for ownership in 794 places, clones atoms with new, parses XML font metrics at runtime and
grows its box trees with no bound. The build flags above just hide the symptoms of that rather than fixing any of it.

## The rewrite

So the second go was a rewrite of the layout algorithms from scratch, keeping the TeX box model from MicroTeX and
dropping the parts that assume an OS. The idea was static allocation, bounded memory and behaviour thats deterministic.

Theres no heap allocation at all after init. The working data for each render is bump allocated out of one static arena
with its size fixed at link time. The nodes are plain structs with nothing owning anything and u16 handles are used
instead of pointers. Font tables are constexpr arrays in flash so theres no file IO while rendering.

When the arena runs out it returns a null handle, the render unwinds to a refusal and the arena gets reset. So running
out of space limits how complicated a formula you can draw, but it doesnt crash or corrupt anything.

The scope is deliberately small, just a fixed subset of math mode with no user defined macros. There are 37 requirements
written down and each one points at the MicroTeX code it replaces, so the rewrite can be traced back to it.

## Testing

This is what made it possible to do with Claude at all. Taking out the heap, the exceptions, the RTTI and the file IO also
takes out everything that stops you testing it on a desktop, so the parser, layout and draw op generation all build and
run natively and only the glyph pixels need hardware, and theres 122 tests across 13 groups that give the same result
every time. The useful bit though is that the old dynamic MicroTeX still builds natively too, so every
function I port can be unit tested against the one its replacing and the expected values come for free instead of getting
worked out by hand. I think thats why AI is good at rewrites in particular. You already have the answer sat next to you,
so it gets you 80% of the way there in 20% of the time. Bun going from Zig to Rust back in May in about 11 days on 64
Claude agents in parallel is the obvious big example of that. Zigs creator called the result unreviewed slop though, which
is the other half of it, the last 20% is where all the actual work ends up.

## What I think of it

Claude rewrote the static version iteratively in about forty minutes, which I wasnt expecting, and the tests against the
reference give me reasonable confidence the behaviour matches for the subset it supports. Im less sure its actually
functionally safe in practice. I ran cppcheck over the twelve library files and it came back with no high or medium
severity defects, which is a clean result but a much smaller claim than functional safety. It finds the problems it knows
how to look for, it doesnt tell me the arena bound is right or that nothing allocates on some path I havent thought about.
If I end up using this a lot, or anyone else does, then I'll come back and review it properly and maybe it gets to be
functionally safe. But 80% of the way there is further than some of my other projects have got, so Im leaving it here for
now.
