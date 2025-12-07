package com.cucook.moc;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication
@MapperScan(basePackages = {
        "com.cucook.moc.recipe.dao"
})
@ComponentScan(
        basePackages = "com.cucook.moc",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = "com\\.cucook\\.moc\\.user\\..*|com\\.cucook\\.moc\\.common\\..*"
        )
)
public class MocApplication {

	public static void main(String[] args) {
		SpringApplication.run(MocApplication.class, args);
	}

}
