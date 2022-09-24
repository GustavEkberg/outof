pub mod list_item {
  use serde::{Serialize, Deserialize};
  use crate::db::db_list::get_items;

  #[derive(Serialize,Deserialize,Debug)]
  pub struct Item {
    pub id: String,
    pub title: String
  }

  pub fn list_command() {
    let items: Vec<Item> = get_items();
    items.iter()
      .for_each(|i| println!("{:#?}", i));

  }
}