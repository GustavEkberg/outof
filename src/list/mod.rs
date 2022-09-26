pub mod list_item {
  use serde::{Serialize, Deserialize};

  #[derive(Serialize,Deserialize,Debug)]
  pub struct Item {
    pub id: String,
    pub title: String,
    pub created: i64,
    pub user: String
  }

  pub trait Chat {
    fn to_chat_message(&self) -> String;
  }

  impl Chat for Item {
    fn to_chat_message(&self) -> String { 
      format!("{} ({}), \n", &self.title, &self.user)
    }
  }
}