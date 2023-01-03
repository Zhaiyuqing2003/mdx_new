export const parseText =
`##comment
    yes, this is a function that do nothing

##something_cool
    ##monad 123
    ##comment yes now we can write this in one line, if they have only one argument
        after some thinking, i think this is carefully united with the
        chaining macro design.

##some_in_consideration
    ##not_only_a_monad 123
        it could have more!
    ##command yes, this is somewhat need to be considered carefully
        like every command, even if it's not monadic, it could put it's first
        argument in the same line
    ##first ##second ##third first param for third macro
        second param for third macro
        third param for third macro
    ##command the previous one example could be rewritten as
        ##foo
            ##bar yes, fucking stacked macro is allowed
            ##baz and you can have two, the result are concatenated
        well, this seemed kinda esoteric

##if 1
    ##then ##display
        this branch is called
    ##else ##display
        this branch is not called
    ##then
        even more
    ##then
        even more

##non-starting-macro-as-literals
    you could just have ##123 as a literal, if it's not starting the line
    and in this case, it's not a macro, it's just a literal

##wow

##exec ##display $a $b 1
    ##where
        $a = 1
        $b = 0

##define
    $name $arg1 $arg2 ...
    $replacement_text
    $replacement_text2
    ...

##comment
    let's consider how the $func is called.
    consider the function $frac $a $b`


export const text = `
##if
    ##choice
        true
        false
    ##then
        Hello
        DoubleHello
    ##else World
    ##else DoubleWorld
`
