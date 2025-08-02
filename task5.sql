-- creating tables
CREATE TABLE BOOKDETAILS (
    id int,
    created_on datetime not null,
    updated_on datetime not null,
    price int,
    discount int,
    is_hard_copy bit,
    book_id int
);

CREATE TABLE BOOK (
    id int,
    created_on datetime not null,
    updated_on datetime not null,
    title varchar(30),
    isbn int,
    author_id int
);

CREATE TABLE AUTHOR (
    id int,
    created_on datetime not null,
    updated_on datetime not null,
    first_name varchar(30),
    last_name varchar(30),
    country_id varchar(30)
);

CREATE TABLE COUNTRY (
    id int,
    created_on datetime not null,
    updated_on datetime not null,
    name varchar(30),
    code varchar(30)
);

-- inserting mock data
INSERT INTO
    COUNTRY (
        id,
        created_on,
        updated_on,
        name,
        code
    )
VALUES (
        1,
        GETDATE (),
        GETDATE (),
        'United States of America',
        'USA'
    ),
    (
        2,
        GETDATE (),
        GETDATE (),
        'Canada',
        'CAN'
    ),
    (
        3,
        GETDATE (),
        GETDATE (),
        'Mexico',
        'MEX'
    ),
    (
        4,
        GETDATE (),
        GETDATE (),
        'China',
        'CHN'
    );

INSERT INTO
    AUTHOR (
        id,
        created_on,
        updated_on,
        first_name,
        last_name,
        country_id
    )
VALUES (
        1,
        GETDATE (),
        GETDATE (),
        'Ernest',
        'Hemingway',
        1
    ), -- USA
    (
        2,
        GETDATE (),
        GETDATE (),
        'Margaret',
        'Atwood',
        2
    ), -- CAN
    (
        3,
        GETDATE (),
        GETDATE (),
        'Carlos',
        'Fuentes',
        3
    ), -- MEX
    (
        4,
        GETDATE (),
        GETDATE (),
        'Mo',
        'Yan',
        4
    );
-- CHN (will have no books)

INSERT INTO
    BOOK (
        id,
        created_on,
        updated_on,
        title,
        isbn,
        author_id
    )
VALUES (
        1,
        GETDATE (),
        GETDATE (),
        'A Farewell to Arms',
        1111,
        1
    ),
    (
        2,
        GETDATE (),
        GETDATE (),
        'The Old Man and the Sea',
        2222,
        1
    ),
    (
        3,
        GETDATE (),
        GETDATE (),
        'The Handmaid''s Tale',
        3333,
        2
    ),
    (
        4,
        GETDATE (),
        GETDATE (),
        'The Death of Artemio Cruz',
        4444,
        3
    ),
    (
        5,
        GETDATE (),
        GETDATE (),
        'The Golden Spring',
        5555,
        3
    );

INSERT INTO
    BOOKDETAILS (
        id,
        created_on,
        updated_on,
        price,
        discount,
        is_hard_copy,
        book_id
    )
VALUES (
        1,
        GETDATE (),
        GETDATE (),
        100,
        25,
        1,
        1
    ), -- A Farewell to Arms (discount in 20-30 range)
    (
        2,
        GETDATE (),
        GETDATE (),
        120,
        15,
        0,
        2
    ), -- The Old Man and the Sea (below range)
    (
        3,
        GETDATE (),
        GETDATE (),
        80,
        20,
        1,
        3
    ), -- The Handmaid's Tale (20% exactly)
    (
        4,
        GETDATE (),
        GETDATE (),
        90,
        30,
        1,
        4
    ), -- The Death of Artemio Cruz (30% exactly)
    (
        5,
        GETDATE (),
        GETDATE (),
        70,
        5,
        0,
        5
    );
-- The Golden Spring (below range)

-- Answers to Queries (to submit)
-- #1
SELECT AUTHOR.ID, AUTHOR.FIRST_NAME, AUTHOR.LAST_NAME, COUNTRY.NAME AS COUNTRY_NAME, BOOK_INFO.TITLE, BOOK_INFO.ISBN, BOOK_INFO.PRICE, BOOK_INFO.DISCOUNT, BOOK_INFO.IS_HARD_COPY
FROM
    AUTHOR
    LEFT JOIN (
        SELECT BOOK.AUTHOR_ID, BOOK.TITLE, BOOK.ISBN, BOOKDETAILS.PRICE, BOOKDETAILS.DISCOUNT, BOOKDETAILS.IS_HARD_COPY
        FROM BOOK
            INNER JOIN BOOKDETAILS ON BOOK.ID = BOOKDETAILS.BOOK_ID
    ) BOOK_INFO ON AUTHOR.ID = BOOK_INFO.AUTHOR_ID
    INNER JOIN COUNTRY ON AUTHOR.COUNTRY_ID = COUNTRY.ID
ORDER BY AUTHOR.LAST_NAME, AUTHOR.FIRST_NAME;
-- #2
SELECT AUTHOR.ID, AUTHOR.FIRST_NAME, AUTHOR.LAST_NAME, COUNTRY.NAME AS COUNTRY_NAME
FROM AUTHOR
    INNER JOIN COUNTRY ON AUTHOR.COUNTRY_ID = COUNTRY.ID
WHERE
    COUNTRY.CODE = "USA";
-- #3
SELECT AUTHOR.ID, AUTHOR.FIRST_NAME, AUTHOR.LAST_NAME, COUNTRY.NAME AS COUNTRY_NAME
FROM
    AUTHOR
    INNER JOIN (
        SELECT BOOK.AUTHOR_ID, COUNT(*) AS COUNT
        FROM BOOK
        GROUP BY
            BOOK.AUTHOR_ID
    ) BOOK_COUNT ON AUTHOR.ID = BOOK_COUNT.AUTHOR_ID
    INNER JOIN COUNTRY ON AUTHOR.COUNTRY_ID = COUNTRY.ID
ORDER BY BOOK_COUNT.COUNT DESC;
-- #4
SELECT COUNT(*)
FROM BOOK
    INNER JOIN (
        SELECT AUTHOR.ID
        FROM AUTHOR
            INNER JOIN COUNTRY ON AUTHOR.COUNTRY_ID = COUNTRY.ID
        WHERE
            COUNTRY.CODE = "USA"
    ) USA_AUTHORS ON BOOK.AUTHOR_ID = USA_AUTHORS.ID;
-- #5
SELECT BOOK.TITLE, BOOK.ISBN, BOOKDETAILS.DISCOUNT, BOOKDETAILS.PRICE
FROM BOOK
    INNER JOIN BOOKDETAILS ON BOOK.ID = BOOKDETAILS.BOOK_ID
WHERE
    DISCOUNT >= 20
    AND DISCOUNT <= 30
ORDER BY BOOKDETAILS.PRICE ASC;
-- #6
SELECT AUTHOR.FIRST_NAME, AUTHOR.LAST_NAME, COALESCE(MIN(BOOKDETAILS.PRICE), -1) AS PRICE
FROM
    AUTHOR
    LEFT JOIN BOOK ON AUTHOR.ID = BOOK.AUTHOR_ID
    LEFT JOIN BOOKDETAILS ON BOOK.ID = BOOKDETAILS.BOOK_ID
GROUP BY
    AUTHOR.ID,
    AUTHOR.FIRST_NAME,
    AUTHOR.LAST_NAME;