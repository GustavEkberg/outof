
pub mod db_list {
  use crate::list::list_item::Item;
  use std::fs::read_to_string;

  const LIST_FILE: &'static str = "./src/data/list.json";

  pub fn get_items() -> Vec<Item> {
    serde_json::from_str(read_to_string(LIST_FILE)
      .unwrap()
      .as_str()
    ).unwrap()
  }

  pub fn create_item(item: Item) {
  }

  pub fn delete_item(id: String) {
  }

}