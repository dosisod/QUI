# QUI
Quick User Interface: Loads a JSON grid of programmable buttons

Example:
![Example Board](/img/eg.png)

# Goal

The goal of this project is to have a simple to setup UI and not to have to hassle with html and css
I prefer more minimalistic UI, and this does just that while still being able to use javascript

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
	"grids":[
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

"bg":{"type":"img","value":"img.png"} //image background from url (tiled)
"bg":{"type":"img64","value":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIA ...etc"} //image background from base64 (tiled)

"bg":{"type":"gradient","value":"X #f00 #0f0 #00f"} //horizontal rainbow
"bg":{"type":"gradient","value":"Y #000 #fff"} //vertical fade to white
```

Other options that may be useful (do these where the `"x"` and such are)

```javascript
"cursor":"http://0.0.0.0/img.png" //changes current cursor, must include http(s)
"action":"/*js here*/" //runs this js code on load
```