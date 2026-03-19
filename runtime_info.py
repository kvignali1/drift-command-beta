import socket


def get_candidate_hostnames():
    hostnames = {"localhost", "127.0.0.1"}

    try:
        hostname = socket.gethostname()
        if hostname:
            hostnames.add(hostname)
    except OSError:
        pass

    return sorted(hostnames)


def get_candidate_ip_addresses():
    addresses = {"127.0.0.1"}

    try:
        hostname = socket.gethostname()
        for family, _, _, _, sockaddr in socket.getaddrinfo(hostname, None):
            if family == socket.AF_INET and sockaddr:
                address = sockaddr[0]
                if address and not address.startswith("169.254."):
                    addresses.add(address)
    except OSError:
        pass

    return sorted(addresses)


def build_server_urls(port: int):
    urls = []
    seen = set()

    for host in [*get_candidate_hostnames(), *get_candidate_ip_addresses()]:
        url = f"http://{host}:{port}"
        if url not in seen:
            seen.add(url)
            urls.append(url)

    return urls
