def calc_total_energy(x: int, n: int) -> int:
    """
    :param x: 单道能量波的基础数值
    :param n: 能量波总道数
    :return: 总能量值
    """
    if n % 2 == 1:
        return x
    else:
        return 0


def main():
    user_input = input("请输入能量波数值和能量波道数：").strip()
    # 分隔符兼容优化：中文逗号、英文逗号全部替换为空格，兼容三种分隔方式
    processed_input = user_input.replace('，', ' ').replace(',', ' ')
    data = list(map(int, processed_input.split()))

    if len(data) == 1:
        x = data[0]
        n = 0
    else:
        x = data[0]
        n = data[1]

    result = calc_total_energy(x, n)
    print(result)

if __name__ == "__main__":
    main()
