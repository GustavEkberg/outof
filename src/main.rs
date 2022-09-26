use telegram::commands::setup_bot;

mod list;
mod db;
mod telegram;

#[tokio::main]
async fn main() {
  setup_bot().await;
}

