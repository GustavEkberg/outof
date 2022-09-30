use chrono::Utc;
use uuid::Uuid;
use crate::list::{Item, Chat, generate_list_name};
use std::fs::{write, read_to_string, create_dir, read_dir};
use std::io::ErrorKind;
use std::path::PathBuf;

const DATA_FOLDER: &'static str = "./src/data/";
const LIST_FOLDER: &'static str = "./src/data/lists/";
const OUTOF_FILE: &'static str = "./src/data/outOfItems.json";

/**
 * Private
 */
fn init_file(file: &str, init_value: &str) {
  create_dir(DATA_FOLDER).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create data folder panic! {:#?}", error)
    }
  });

  create_dir(LIST_FOLDER).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create list folder panic! {:#?}", error)
    }
  });
    
  write(file, init_value).unwrap();
}

fn read_file_all_list_items() -> Vec<Item> {
  serde_json::from_str(
    read_to_string(OUTOF_FILE).unwrap_or_else(|error| {
      match error.kind() {
        ErrorKind::NotFound => {
          init_file(OUTOF_FILE, "[]");
          "[]".to_string()
        },
        _ => panic!("Read all list file panic! {:#?}", error)
      }
    }).as_str()
  ).unwrap()
}

pub fn read_file_list_items(list: &String) -> Vec<Item> {
  serde_json::from_str(
    read_to_string(list_name_to_file(list)).unwrap_or_else(|error| {
      match error.kind() {
        ErrorKind::NotFound => {
          init_file(OUTOF_FILE, "[]");
          "[]".to_string()
        },
        _ => panic!("Read list file panic! {:#?}", error)
      }
    }).as_str()
  ).unwrap()
}

fn write_string_to_file(items: String) {
  write(OUTOF_FILE, items).unwrap();
}

fn parse_items(
  string: &String, 
  user: &String
) -> Vec<Item> {
  string.split(",")
    .into_iter()
    .map(|item| Item {
      id: Uuid::new_v4().to_string(), 
      title: item.to_string(),
      user: user.to_string(),
      created: Utc::now().timestamp()
    })
    .collect()
}

/**
 * Public 
 */
pub fn get_all_items() -> String {
  let mut items: String = String::new();

  for item in read_file_all_list_items() {
    items += &item.to_chat_message()
  };
  items
}

pub fn get_list_items(list: &String) -> String {
  let mut items: String = String::new();

  items += &String::from("asd");
  for item in read_file_list_items(list) {
    items += &item.to_chat_message()
  };
  items
}

pub fn create_items(
  items: &String, 
  user: &String
) {
  let mut list = read_file_all_list_items();
  for item in parse_items(items, user) {
    list.push(item);
  }
  write_string_to_file(serde_json::to_string(&list).unwrap());
}

pub fn _delete_item(id: String) {
  let list: Vec<Item> = read_file_all_list_items()
    .into_iter()
    .filter(|i| !i.id.eq(&id))
    .collect();
  write_string_to_file(serde_json::to_string(&list).unwrap());
}

pub fn create_new_list() -> String {
  let name = generate_list_name();
  init_file(
    &list_name_to_file(&name),
    &serde_json::to_string(
      &read_file_all_list_items()
    ).unwrap()
  );
  name
}

pub fn get_lists_names() -> Vec<String>{
 read_dir(LIST_FOLDER).unwrap()
    .into_iter()
    .map(|entry| file_to_list_name(&entry
        .unwrap()
        .path())
      .unwrap())
    .collect::<Vec<String>>()
}

pub fn list_name_to_file(name: &String) -> String {
  format!("{}{}.json",
    LIST_FOLDER,
    name
  )
}

pub fn file_to_list_name(file: &PathBuf) -> Option<String> {
  if !file.is_file() {
    None
  } else {
    Some(file.file_name()
      .unwrap()
      .to_str()
      .unwrap()
      .to_string()
      .replace(".json", "")
      .replace("_", " ")
    )
  }
}
