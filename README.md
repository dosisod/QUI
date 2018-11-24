# QUI
Quick User Interface: Loads a JSON grid of programmable buttons

Example:
![Example Board](/img/eg.png)

# Inspiration

Wanted to make a simple to deploy UI in JSON that could be rendered in a HTML canvas

I got the idea after playing Watchdogs and seeing all the UI elements:

![Watchdogs Screenshot](/img/wd.jpg)

# Basic Syntax

```javascript
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

Many other background options are available, formattings are listed below:

```javascript
"bg":{"type":"color","value":"#00f"} //solid blue (hex)
"bg":{"type":"color","value":"rgb(0,0,255)"} //solid blue (rgb)
"bg":{"type":"color","value":"rgba(0,0,255,0.5)"} //see-through blue (rgba)

"bg":{"type":"img","value":"img.png"} //image background (tiled)

"bg":{"type":"gradient","value":"X #f00 #0f0 #00f"} //horizontal rainbow
"bg":{"type":"gradient","value":"Y #000 #fff"} //vertical fade to white
```
