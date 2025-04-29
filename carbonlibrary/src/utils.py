

def dict_parser(data, paths): 
    for key in paths:
        if isinstance(data, dict):
           data = data.get(key)
        elif isinstance(data, list):
            data = data[key] if data else None        
    return data
        