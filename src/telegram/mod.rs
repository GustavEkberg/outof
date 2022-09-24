pub mod commands {
  use uuid::Uuid;
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
        id: Uuid::new_v4().to_string(), 
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