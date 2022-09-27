use telegram::setup_bot;

mod telegram;
mod db;
mod list;
mod server;

#[tokio::main]
async fn main() {
  setup_bot().await;
}