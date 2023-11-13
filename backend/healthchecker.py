import time

if __name__ == "__main__":
    with open("healthcheck","r") as f:
        timestamp = f.read()
        timestamp = int(timestamp.replace("\n",""))
        diff = int(time.time()) - timestamp
        print(diff)
        if diff > 20:
            raise ValueError("Serice ist tot")