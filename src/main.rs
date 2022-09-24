use db::db_list::create_items;
use list::list_item::list_command;
use telegram::commands::{get_command, CommandType};

mod list;
mod db;
mod telegram;

fn main() {
  let command: CommandType = get_command();
  match command {
    CommandType::Generate => println!("Generate!"),
    CommandType::List => list_command(),
    CommandType::OutOf(items) => {
      create_items(items) 
    }
  }

}

