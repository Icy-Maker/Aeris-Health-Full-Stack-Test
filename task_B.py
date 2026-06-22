
def calc_craft_number(n: int):
    """
    :param n: 推进器总数
    :return: 合法时返回 (最少飞船数, 最多飞船数)；无解返回 -1
    """
    # 无解判断：奇数 或 小于4
    if n < 4 or n % 2 != 0:
        return None

    # 最大优先用A型4推进器
    max_count = n // 4

    # 最小优先用B型6推进器
    remainder = n % 6
    if remainder == 0:
        min_count = n // 6
    else:
        min_count = n // 6 + 1

    return min_count, max_count


def main():
    n = int(input("请输入所有飞船的推进器总数：").strip())
    
    result = calc_craft_number(n)

    if result is None:
        print(-1)
    else:
        min_count, max_count = result
        print(f"最少飞船数：{min_count}")
        print(f"最多飞船数：{max_count}")


if __name__ == "__main__":
    main()