## About
Outof is a minimal grocery list service for a single or shared household using [Telegram](https://telegram.org/) as their main communication. 

## Installation
Invite [@iamoutof_bot](https://t.me/iamoutof_bot) to a channel.

## Usage

### Commands
Outof consists of 3 commands:
- `/outof item, item...` - Add new items that you have run outof.
  - Example: `/outof candles, garlic, wooden stakes` 
- `/generate` - Generates a list containing all items, with a random name to use when you go shopping, responding with a link to the list.
- `/list` - Display a list of all current items you are outof.


#### List
A list has two options for every item. One option is to mark it as **purchased**. It will then be removed from the main list and the current list.
The other option is to mark it as **not purchased** in this shopping session. It will be removed from the current list but not removed from the main list. When a list is generated the next time, the item will still be present.

When a list no longer has any items, it will be removed. At the end of every shopping session, the list should be empty.

## Development
Environment variables:
`TELEGRAM_BOT` is the API token for your telegram bot. **Required**.    
`DOMAIN` is the domain of your website for lists, it defaults to `127.0.0.1:8888`. @iamoutof_bot uses [outof.im](https://outof.im/) 


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)