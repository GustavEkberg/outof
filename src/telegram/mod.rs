pub mod commands {
  use crate::list::list_item::Item;

  pub enum CommandType {
    OutOf(Vec<Item>),
    Generate,
    List
  }

  /**
   * Get Telegram bot updates sine last successful event
   */
  fn get_updates(event: u32) {
  }

  pub fn get_command() -> CommandType {
    CommandType::List
    // CommandType::OutOf(vec![
    //   Item {
    //     id: String::from("id"), 
    //     title: String::from("TITLE")
    //   }
    // ])
  }
}

pub mod messages {
  fn format_string() {
  }

  pub fn send_message() {
  }
}