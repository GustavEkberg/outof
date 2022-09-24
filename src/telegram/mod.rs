pub mod commands {
  use crate::list::list_item::Item;

  pub enum CommandType {
    OutOf(Vec<Item>),
    Generate,
    List
  }

  fn get_updates(event: u32) {
  }

  pub fn get_command() -> CommandType {
    // CommandType::List
    CommandType::OutOf(vec![
      Item {
        id: String::from("id2"), 
        title: String::from("TITLE2")
      }
    ])
  }
}

pub mod messages {
  fn format_string() {
  }

  pub fn send_message() {
  }
}