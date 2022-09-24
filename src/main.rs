use list::list_item::{list_command, create_command, generate_command};
use telegram::commands::{get_command, CommandType};

mod list;
mod db;
mod telegram;

fn main() {
  let command: CommandType = get_command();
  match command {
    CommandType::Generate => generate_command(),
    CommandType::List => list_command(),
    CommandType::OutOf(items) => create_command(items)  
  }
}

