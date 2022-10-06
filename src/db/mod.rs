use crate::list::{Item, list_name_to_file};
use std::fs::{
  write, 
  read_to_string, 
  create_dir, 
  remove_file, read_dir
};
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

pub const DATA_FOLDER: &'static str = "./data/";

pub fn init_user_files(chat_id: &String) {
  create_dir(DATA_FOLDER).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create data folder panic! {:#?}", error)
    }
  });

  create_dir(
    &format!("{}/{}", DATA_FOLDER, chat_id)
  ).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create user data folder panic! {:#?}", error)
    }
  });

  create_dir(
    &format!("{}/{}/lists", DATA_FOLDER, chat_id)
  ).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create user list folder panic! {:#?}", error)
    }
  });
    

  write(
    &format!("{}/{}/items.json", DATA_FOLDER, chat_id)
  , "[]"
  ).unwrap();
}

pub fn read_file_all_list_items(chat_id: &String) -> Vec<Item> {
  serde_json::from_str(
    read_to_string(
      &format!("{}/{}/items.json", DATA_FOLDER, chat_id)
    ).unwrap()
    .as_str()
  ).unwrap()
}

pub fn read_list_names(chat_id: &String) -> Vec<PathBuf> {
  read_dir(format!("{}/{}/lists/",
    DATA_FOLDER,
    chat_id,
  )).unwrap()
  .map(|entry| entry
    .unwrap()
    .path()
  )
  .collect()
}

pub fn read_file_list_items(
  chat_id: &String, 
  list_name: &String
) -> Option<Vec<Item>> {
  if !Path::new(
    &list_name_to_file(
      chat_id, 
      list_name
    )
  ).exists() {
    None
  } else {
    Some(
      serde_json::from_str(
        read_to_string(
          list_name_to_file(
            chat_id, 
            list_name
          )
        ).unwrap()
        .as_str()
      ).unwrap()
    )
  }
}

pub fn write_string_to_file(
  file: &Path,
  items: &String
) {
  write(file, items).unwrap();
}

pub fn remove_list_file(
  chat_id: &String,
  list_name: &String
) {
  remove_file(
    list_name_to_file(
      chat_id, 
      list_name
    )
  ).unwrap();
}

