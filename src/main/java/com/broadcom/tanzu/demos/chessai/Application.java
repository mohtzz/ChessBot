

package com.broadcom.tanzu.demos.chessai;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.annotation.RegisterReflection;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@RegisterReflectionForBinding(Board.class)
@RegisterReflection(classes = {BoardFormatter.class, Board.class},
        memberCategories = {MemberCategory.INVOKE_PUBLIC_METHODS})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
