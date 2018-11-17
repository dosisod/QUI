# QUI
Quick User Interface: Loads a JSON grid of programmable buttons

Example:
![Example Board](/img/eg.png)

# Inspiration

Wanted to make a simple to deploy UI in JSON that could be rendered in a HTML canvas

I got the idea after playing Watchdogs and seeing all the UI elements:

![Watchdogs Screenshot](/img/wd.jpg)

# Basic Syntax

```josn
{
	"x":4,
	"y":4,    //Max X and Y size

	//Array of all board elemnts, rendered in order
	"board":[
		{
		//Starting X and Y, then Width and Height in grid sizes
		"box":[0,0,4,4],

		//Displays an image background
		"bg":{"type":"img","value":"bg.png"},

		//Displays text in grid
		"text":"Hello World!", //Some basic text to display

		//Runs JS from string!
		"action":"console.log('Hello Console!')"
		}
	//As many grids as you want can be put into this array
	//Grids are rendered ontop of eachother, in order first to last
	]
}
```
